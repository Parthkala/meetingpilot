const db = require('../db');
const { MEETING_1, MEETING_2 } = require('../seed');
const { analyzeMeeting } = require('./meetings');

// Clear database
function resetDatabase() {
  db.exec('DELETE FROM decisions');
  db.exec('DELETE FROM action_items');
  db.exec('DELETE FROM conflicts');
  db.exec('DELETE FROM kanban_cards');
  db.exec('DELETE FROM audit_log');
  db.exec('DELETE FROM meetings');
}

// POST /api/demo/reset
function resetDemoData() {
  resetDatabase();
  return {
    success: true,
    message: 'Database reset to clean state.',
    demo_transcripts: {
      meeting_1: MEETING_1,
      meeting_2: MEETING_2
    }
  };
}

// POST /api/demo/load
async function loadDemoData() {
  resetDatabase();

  // Analyze Meeting 1 in demo mode
  const res1 = await analyzeMeeting(MEETING_1, true);

  // Analyze Meeting 2 in demo mode (detects conflicts with Meeting 1!)
  const res2 = await analyzeMeeting(MEETING_2, true);

  return {
    success: true,
    message: 'Demo seed loaded successfully: 2 meetings, decisions, action items, and cross-meeting conflicts.',
    meetings: [res1.meeting, res2.meeting],
    total_conflicts: res2.conflicts.length,
    demo_transcripts: {
      meeting_1: MEETING_1,
      meeting_2: MEETING_2
    }
  };
}

// GET /api/demo/status
function getDemoStatus() {
  const meetingCount = db.prepare('SELECT COUNT(*) as count FROM meetings').get().count;
  const actionCount = db.prepare('SELECT COUNT(*) as count FROM action_items').get().count;
  const conflictCount = db.prepare('SELECT COUNT(*) as count FROM conflicts').get().count;

  return {
    has_seed: meetingCount >= 2,
    meeting_count: meetingCount,
    action_item_count: actionCount,
    conflict_count: conflictCount,
    demo_transcripts: {
      meeting_1: MEETING_1,
      meeting_2: MEETING_2
    }
  };
}

module.exports = { loadDemoData, resetDemoData, getDemoStatus };
