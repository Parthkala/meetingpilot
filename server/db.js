const path = require('path');

let db;

function createInMemoryDb() {
  const tables = {
    meetings: [],
    decisions: [],
    action_items: [],
    conflicts: [],
    audit_log: [],
    kanban_cards: [],
  };

  return {
    exec(sql) {
      if (sql.includes('DELETE FROM')) {
        const match = sql.match(/DELETE FROM\s+(\w+)/i);
        if (match && tables[match[1]]) {
          tables[match[1]] = [];
        }
      }
    },
    prepare(sql) {
      const clean = sql.trim();

      // SELECT COUNT(*)
      if (/SELECT COUNT\(\*\)/i.test(clean)) {
        const match = clean.match(/FROM\s+(\w+)/i);
        const tbl = match ? tables[match[1]] : [];
        return {
          get: () => ({ count: tbl ? tbl.length : 0 }),
          all: () => [{ count: tbl ? tbl.length : 0 }]
        };
      }

      // SELECT meetings
      if (/SELECT .* FROM meetings/i.test(clean)) {
        if (/WHERE id = \?/i.test(clean)) {
          return {
            get: (id) => tables.meetings.find(m => m.id === id) || null,
            all: (id) => tables.meetings.filter(m => m.id === id)
          };
        }
        return {
          all: () => [...tables.meetings].sort((a, b) => (a.date || '').localeCompare(b.date || '')),
          get: () => tables.meetings[0] || null
        };
      }

      // SELECT decisions
      if (/SELECT .* FROM decisions/i.test(clean)) {
        if (/WHERE meeting_id = \?/i.test(clean)) {
          return {
            all: (mId) => tables.decisions.filter(d => d.meeting_id === mId),
            get: (mId) => tables.decisions.find(d => d.meeting_id === mId) || null
          };
        }
        return {
          all: () => tables.decisions.map(d => {
            const m = tables.meetings.find(x => x.id === d.meeting_id);
            return { ...d, meeting_title: m?.title, meeting_date: m?.date };
          })
        };
      }

      // SELECT action_items
      if (/SELECT .* FROM action_items/i.test(clean)) {
        if (/WHERE id = \?/i.test(clean)) {
          return {
            get: (id) => tables.action_items.find(a => a.id === id) || null,
            all: (id) => tables.action_items.filter(a => a.id === id)
          };
        }
        if (/WHERE meeting_id = \?/i.test(clean)) {
          return {
            all: (mId) => tables.action_items.filter(a => a.meeting_id === mId),
            get: (mId) => tables.action_items.find(a => a.meeting_id === mId) || null
          };
        }
        return {
          all: () => tables.action_items.map(a => {
            const m = tables.meetings.find(x => x.id === a.meeting_id);
            return { ...a, meeting_title: m?.title, meeting_date: m?.date };
          })
        };
      }

      // SELECT conflicts
      if (/SELECT .* FROM conflicts/i.test(clean)) {
        if (/WHERE meeting_id = \?/i.test(clean)) {
          return {
            all: (mId) => tables.conflicts.filter(c => c.meeting_id === mId),
            get: (mId) => tables.conflicts.find(c => c.meeting_id === mId) || null
          };
        }
        return {
          all: () => tables.conflicts.map(c => {
            const m = tables.meetings.find(x => x.id === c.meeting_id);
            return { ...c, meeting_title: m?.title, meeting_date: m?.date };
          })
        };
      }

      // INSERT INTO
      if (/INSERT INTO/i.test(clean)) {
        const match = clean.match(/INSERT INTO\s+(\w+)/i);
        const tableName = match ? match[1] : null;

        return {
          run: (...args) => {
            if (!tableName || !tables[tableName]) return { changes: 1 };
            if (tableName === 'meetings') {
              const [id, title, date, transcript, summary, created_at] = args;
              tables.meetings.push({ id, title, date, transcript, summary, created_at });
            } else if (tableName === 'decisions') {
              const [id, meeting_id, text, evidence_quote, evidence_line_start, evidence_line_end] = args;
              tables.decisions.push({ id, meeting_id, text, evidence_quote, evidence_line_start, evidence_line_end });
            } else if (tableName === 'action_items') {
              const [id, meeting_id, title, owner, deadline_iso, deadline_raw, priority, confidence, needs_clarification, clarification_reason, evidence_quote, status] = args;
              tables.action_items.push({ id, meeting_id, title, owner, deadline_iso, deadline_raw, priority, confidence, needs_clarification, clarification_reason, evidence_quote, status });
            } else if (tableName === 'conflicts') {
              const [id, meeting_id, type, severity, description, previous_value, new_value, previous_meeting_id, evidence_quote] = args;
              tables.conflicts.push({ id, meeting_id, type, severity, description, previous_value, new_value, previous_meeting_id, evidence_quote });
            } else if (tableName === 'audit_log') {
              const [id, ts, event, payload] = args;
              tables.audit_log.push({ id, ts, event, payload });
            } else if (tableName === 'kanban_cards') {
              const [id, action_item_id, title, owner, status, created_at] = args;
              tables.kanban_cards.push({ id, action_item_id, title, owner, status, created_at });
            }
            return { changes: 1 };
          }
        };
      }

      // UPDATE action_items
      if (/UPDATE action_items/i.test(clean)) {
        return {
          run: (...args) => {
            const id = args[args.length - 1];
            const item = tables.action_items.find(a => a.id === id);
            if (!item) return { changes: 0 };

            if (/status = \?, tracker_url = \?/i.test(clean)) {
              item.status = args[0];
              item.tracker_url = args[1];
            } else {
              // Dynamic fields update
              const fieldMatches = clean.match(/(\w+)\s*=\s*\?/g);
              if (fieldMatches) {
                fieldMatches.forEach((f, idx) => {
                  const fieldName = f.split('=')[0].trim();
                  item[fieldName] = args[idx];
                });
              }
            }
            return { changes: 1 };
          }
        };
      }

      // Default mock
      return {
        run: () => ({ changes: 1 }),
        get: () => null,
        all: () => []
      };
    }
  };
}

try {
  const { DatabaseSync } = require('node:sqlite');
  if (process.env.VERCEL) {
    db = new DatabaseSync(':memory:');
  } else {
    const dbPath = path.join(__dirname, 'meetingpilot.db');
    db = new DatabaseSync(dbPath);
  }
  db.exec('PRAGMA journal_mode=WAL');
  db.exec('PRAGMA foreign_keys=ON');
} catch (e) {
  console.log('[MeetingPilot DB] Using in-memory store fallback');
  db = createInMemoryDb();
}

db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    title TEXT,
    date TEXT,
    transcript TEXT,
    summary TEXT,
    created_at TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    meeting_id TEXT,
    text TEXT,
    evidence_quote TEXT,
    evidence_line_start INT,
    evidence_line_end INT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS action_items (
    id TEXT PRIMARY KEY,
    meeting_id TEXT,
    title TEXT,
    owner TEXT,
    deadline_iso TEXT,
    deadline_raw TEXT,
    priority TEXT,
    confidence REAL,
    needs_clarification INT,
    clarification_reason TEXT,
    evidence_quote TEXT,
    status TEXT DEFAULT 'pending',
    tracker_url TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS conflicts (
    id TEXT PRIMARY KEY,
    meeting_id TEXT,
    type TEXT,
    severity TEXT,
    description TEXT,
    previous_value TEXT,
    new_value TEXT,
    previous_meeting_id TEXT,
    evidence_quote TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    ts TEXT,
    event TEXT,
    payload TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS kanban_cards (
    id TEXT PRIMARY KEY,
    action_item_id TEXT,
    title TEXT,
    owner TEXT,
    status TEXT,
    created_at TEXT
  )
`);

module.exports = db;
