const crypto = require('crypto');
const db = require('../db');
const env = require('../env');
const demoCache = require('../demo-cache');
const { analyzeWithLLM } = require('../llm/provider');
const { matchEvidenceLines } = require('../utils/evidence');

// GET /api/meetings
function listMeetings() {
  const rows = db.prepare('SELECT id, title, date, summary, transcript, created_at FROM meetings ORDER BY date ASC, created_at ASC').all();
  return { meetings: rows };
}

// GET /api/meetings/:id
function getMeeting(id) {
  const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id);
  if (!meeting) return null;

  const decisions = db.prepare('SELECT * FROM decisions WHERE meeting_id = ?').all(id);
  const actionItems = db.prepare('SELECT * FROM action_items WHERE meeting_id = ?').all(id);
  const conflicts = db.prepare('SELECT * FROM conflicts WHERE meeting_id = ?').all(id);

  return {
    ...meeting,
    decisions,
    action_items: actionItems.map(a => ({ ...a, needs_clarification: Boolean(a.needs_clarification) })),
    conflicts
  };
}

// POST /api/meetings/analyze
async function analyzeMeeting(body, forceDemoMode = null) {
  const { title, date, transcript } = body;
  if (!title || !transcript) {
    throw new Error('Title and transcript are required');
  }

  const meetingDate = date || new Date().toISOString().slice(0, 10);
  const useDemoMode = forceDemoMode !== null ? forceDemoMode : env.DEMO_MODE;

  // 1. Load memory: previous meetings, decisions, active action items
  const previousMeetings = db.prepare('SELECT id, title, date, summary FROM meetings ORDER BY date ASC').all();
  const memory = previousMeetings.map(m => {
    const decisions = db.prepare('SELECT text, evidence_quote FROM decisions WHERE meeting_id = ?').all(m.id);
    const action_items = db.prepare('SELECT title, owner, deadline_iso, deadline_raw, status FROM action_items WHERE meeting_id = ?').all(m.id);
    return {
      id: m.id,
      title: m.title,
      date: m.date,
      summary: m.summary,
      decisions,
      action_items
    };
  });

  // 2. Fetch or compute analysis
  let result;
  const cached = demoCache[title.trim()];

  if (useDemoMode && cached) {
    result = JSON.parse(JSON.stringify(cached));
    // Link previous_meeting_id if available in memory
    if (result.conflicts && previousMeetings.length > 0) {
      result.conflicts.forEach(c => {
        c.previous_meeting_id = previousMeetings[previousMeetings.length - 1].id;
      });
    }
  } else {
    result = await analyzeWithLLM({ title, date: meetingDate, transcript, memory });
  }

  // 3. Match evidence lines
  const decisionsWithLines = (result.decisions || []).map(d => {
    const lines = matchEvidenceLines(transcript, d.evidence_quote);
    return {
      ...d,
      evidence_line_start: lines.line_start,
      evidence_line_end: lines.line_end
    };
  });

  const actionItemsWithLines = (result.action_items || []).map(a => {
    const lines = matchEvidenceLines(transcript, a.evidence_quote);
    return {
      ...a,
      evidence_line_start: lines.line_start,
      evidence_line_end: lines.line_end,
      status: 'pending'
    };
  });

  // 4. Save to Database
  const meetingId = crypto.randomUUID();
  const now = new Date().toISOString();

  const insertMeeting = db.prepare(`
    INSERT INTO meetings (id, title, date, transcript, summary, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertMeeting.run(meetingId, title, meetingDate, transcript, result.summary || '', now);

  const insertDecision = db.prepare(`
    INSERT INTO decisions (id, meeting_id, text, evidence_quote, evidence_line_start, evidence_line_end)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const d of decisionsWithLines) {
    const dId = crypto.randomUUID();
    d.id = dId;
    insertDecision.run(dId, meetingId, d.text, d.evidence_quote, d.evidence_line_start, d.evidence_line_end);
  }

  const insertAction = db.prepare(`
    INSERT INTO action_items (
      id, meeting_id, title, owner, deadline_iso, deadline_raw, priority,
      confidence, needs_clarification, clarification_reason, evidence_quote, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `);
  for (const a of actionItemsWithLines) {
    const aId = crypto.randomUUID();
    a.id = aId;
    insertAction.run(
      aId,
      meetingId,
      a.title,
      a.owner || null,
      a.deadline_iso || null,
      a.deadline_raw || null,
      a.priority || 'medium',
      typeof a.confidence === 'number' ? a.confidence : 0.8,
      a.needs_clarification ? 1 : 0,
      a.clarification_reason || null,
      a.evidence_quote || ''
    );
  }

  const insertConflict = db.prepare(`
    INSERT INTO conflicts (
      id, meeting_id, type, severity, description, previous_value, new_value, previous_meeting_id, evidence_quote
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const savedConflicts = [];
  for (const c of (result.conflicts || [])) {
    const cId = crypto.randomUUID();
    const cObj = { ...c, id: cId, meeting_id: meetingId };
    savedConflicts.push(cObj);
    insertConflict.run(
      cId,
      meetingId,
      c.type,
      c.severity || 'medium',
      c.description,
      c.previous_value || null,
      c.new_value || null,
      c.previous_meeting_id || (previousMeetings[0]?.id || null),
      c.evidence_quote || null
    );
  }

  return {
    meeting: {
      id: meetingId,
      title,
      date: meetingDate,
      transcript,
      summary: result.summary,
      created_at: now
    },
    decisions: decisionsWithLines,
    action_items: actionItemsWithLines,
    conflicts: savedConflicts
  };
}

module.exports = { listMeetings, getMeeting, analyzeMeeting };
