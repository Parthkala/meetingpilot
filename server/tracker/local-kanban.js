const crypto = require('crypto');
const db = require('../db');
const { TrackerAdapter } = require('./adapter');

class LocalKanbanAdapter extends TrackerAdapter {
  constructor() {
    super('LocalKanban');
  }

  async push(item) {
    try {
      const cardId = crypto.randomUUID();
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO kanban_cards (id, action_item_id, title, owner, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(cardId, item.id, item.title, item.owner || 'Unassigned', 'todo', now);

      const localUrl = `/kanban#card-${cardId}`;
      return { success: true, url: localUrl, id: cardId };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async checkConnection() {
    try {
      db.prepare('SELECT COUNT(*) as count FROM kanban_cards').get();
      return { connected: true, details: 'Local SQLite Kanban Board Active' };
    } catch (err) {
      return { connected: false, details: err.message };
    }
  }
}

module.exports = { LocalKanbanAdapter };
