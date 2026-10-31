const env = require('../env');
const { TrelloAdapter } = require('./trello');
const { LocalKanbanAdapter } = require('./local-kanban');

const trelloAdapter = new TrelloAdapter({
  apiKey: env.TRELLO_API_KEY,
  token: env.TRELLO_TOKEN,
  listId: env.TRELLO_LIST_ID,
});

const localKanbanAdapter = new LocalKanbanAdapter();

function getTracker() {
  if (trelloAdapter.isConfigured()) {
    return {
      name: 'Trello',
      push: async (item) => {
        const trelloRes = await trelloAdapter.push(item);
        if (trelloRes.success) return trelloRes;
        console.warn(`[Tracker] Trello push failed: ${trelloRes.error}. Falling back to LocalKanban.`);
        const localRes = await localKanbanAdapter.push(item);
        return {
          ...localRes,
          fallback: true,
          fallback_reason: trelloRes.error
        };
      }
    };
  }

  return {
    name: 'LocalKanban',
    push: (item) => localKanbanAdapter.push(item)
  };
}

async function getTrackerStatus() {
  if (trelloAdapter.isConfigured()) {
    const trelloConn = await trelloAdapter.checkConnection();
    if (trelloConn.connected) {
      return { type: 'Trello', connected: true, details: trelloConn.details };
    }
    return {
      type: 'LocalKanban (Fallback)',
      connected: true,
      details: `Trello unavailable (${trelloConn.details}). Using SQLite Local Kanban.`
    };
  }

  const localConn = await localKanbanAdapter.checkConnection();
  return {
    type: 'LocalKanban',
    connected: localConn.connected,
    details: localConn.details
  };
}

module.exports = { getTracker, getTrackerStatus };
