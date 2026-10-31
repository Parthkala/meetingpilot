const env = require('../env');
const db = require('../db');
const { getTrackerStatus } = require('../tracker');

async function handleHealth(req, res) {
  let dbStatus = 'ok';
  try {
    db.prepare('SELECT 1').get();
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const trackerStatus = await getTrackerStatus();

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    llm: {
      configured: Boolean(env.GEMINI_API_KEY),
      model: env.GEMINI_MODEL
    },
    tracker: trackerStatus,
    db: dbStatus,
    demo_mode: env.DEMO_MODE
  };
}

module.exports = { handleHealth };
