const { TrackerAdapter } = require('./adapter');

class TrelloAdapter extends TrackerAdapter {
  constructor({ apiKey, token, listId }) {
    super('Trello');
    this.apiKey = apiKey;
    this.token = token;
    this.listId = listId;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.token && this.listId);
  }

  async push(item) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Trello credentials or list ID missing' };
    }

    try {
      const desc = [
        `**Owner**: ${item.owner || 'Unassigned'}`,
        `**Deadline**: ${item.deadline_iso || item.deadline_raw || 'None specified'}`,
        `**Priority**: ${item.priority || 'medium'}`,
        `**Confidence**: ${Math.round((item.confidence || 0) * 100)}%`,
        `**Meeting Evidence**: "${item.evidence_quote || ''}"`
      ].join('\n\n');

      const url = `https://api.trello.com/1/cards?idList=${encodeURIComponent(this.listId)}&key=${encodeURIComponent(this.apiKey)}&token=${encodeURIComponent(this.token)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.title,
          desc,
          due: item.deadline_iso ? new Date(item.deadline_iso).toISOString() : null,
          pos: 'bottom'
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Trello API error (${res.status}): ${errorText}` };
      }

      const card = await res.json();
      return { success: true, url: card.shortUrl || card.url, id: card.id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async checkConnection() {
    if (!this.isConfigured()) {
      return { connected: false, details: 'Trello credentials not configured' };
    }
    try {
      const url = `https://api.trello.com/1/lists/${encodeURIComponent(this.listId)}?key=${encodeURIComponent(this.apiKey)}&token=${encodeURIComponent(this.token)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const list = await res.json();
        return { connected: true, details: `Connected to list: ${list.name}` };
      }
      return { connected: false, details: `Trello returned ${res.status}` };
    } catch (err) {
      return { connected: false, details: err.message };
    }
  }
}

module.exports = { TrelloAdapter };
