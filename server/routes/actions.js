const crypto = require('crypto');
const db = require('../db');
const { getTracker } = require('../tracker');

// PATCH /api/action-items/:id
function updateActionItem(id, updates) {
  const existing = db.prepare('SELECT * FROM action_items WHERE id = ?').get(id);
  if (!existing) return null;

  const allowed = ['status', 'title', 'owner', 'deadline_iso', 'deadline_raw', 'priority', 'needs_clarification', 'clarification_reason'];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (typeof updates[key] !== 'undefined') {
      fields.push(`${key} = ?`);
      let val = updates[key];
      if (key === 'needs_clarification') val = val ? 1 : 0;
      values.push(val);
    }
  }

  if (fields.length === 0) return existing;

  values.push(id);
  db.prepare(`UPDATE action_items SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  // Write audit log
  const auditId = crypto.randomUUID();
  db.prepare('INSERT INTO audit_log (id, ts, event, payload) VALUES (?, ?, ?, ?)').run(
    auditId,
    new Date().toISOString(),
    'action_item_updated',
    JSON.stringify({ id, updates })
  );

  return db.prepare('SELECT * FROM action_items WHERE id = ?').get(id);
}

// POST /api/sync
async function syncActionItems(itemIds) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    throw new Error('item_ids must be a non-empty array');
  }

  const tracker = getTracker();
  const results = [];

  for (const id of itemIds) {
    const item = db.prepare('SELECT * FROM action_items WHERE id = ?').get(id);
    if (!item) {
      results.push({ id, success: false, error: 'Item not found' });
      continue;
    }

    if (item.status !== 'approved') {
      results.push({ id, success: false, error: `Item status must be 'approved' before sync (current: ${item.status})` });
      continue;
    }

    const pushResult = await tracker.push(item);
    if (pushResult.success) {
      db.prepare('UPDATE action_items SET status = ?, tracker_url = ? WHERE id = ?').run(
        'synced',
        pushResult.url || `/tracker/${pushResult.id}`,
        id
      );

      // Audit log
      db.prepare('INSERT INTO audit_log (id, ts, event, payload) VALUES (?, ?, ?, ?)').run(
        crypto.randomUUID(),
        new Date().toISOString(),
        'action_item_synced',
        JSON.stringify({
          id,
          title: item.title,
          tracker: tracker.name,
          tracker_url: pushResult.url,
          fallback: pushResult.fallback || false
        })
      );

      results.push({
        id,
        success: true,
        tracker: tracker.name,
        tracker_url: pushResult.url,
        fallback: pushResult.fallback || false
      });
    } else {
      results.push({ id, success: false, error: pushResult.error });
    }
  }

  return { results };
}

// GET /api/kanban
function getKanban() {
  const items = db.prepare(`
    SELECT a.*, m.title as meeting_title, m.date as meeting_date
    FROM action_items a
    LEFT JOIN meetings m ON a.meeting_id = m.id
    ORDER BY a.deadline_iso ASC, a.id DESC
  `).all();

  const columns = {
    pending: [],
    approved: [],
    synced: [],
    rejected: []
  };

  for (const item of items) {
    const status = columns[item.status] ? item.status : 'pending';
    columns[status].push({
      ...item,
      needs_clarification: Boolean(item.needs_clarification)
    });
  }

  return { columns, total: items.length };
}

// GET /api/timeline
function getTimeline() {
  const decisions = db.prepare(`
    SELECT d.*, m.title as meeting_title, m.date as meeting_date
    FROM decisions d
    JOIN meetings m ON d.meeting_id = m.id
    ORDER BY m.date ASC, d.id ASC
  `).all();

  const conflicts = db.prepare(`
    SELECT c.*, m.title as meeting_title, m.date as meeting_date
    FROM conflicts c
    JOIN meetings m ON c.meeting_id = m.id
    ORDER BY m.date ASC, c.id ASC
  `).all();

  return { decisions, conflicts };
}

module.exports = { updateActionItem, syncActionItems, getKanban, getTimeline };
