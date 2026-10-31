const fs = require('fs');
const path = require('path');

function loadEnv() {
  const defaults = {
    GEMINI_API_KEY: '',
    GEMINI_MODEL: 'gemini-2.0-flash',
    TRELLO_API_KEY: '',
    TRELLO_TOKEN: '',
    TRELLO_LIST_ID: '',
    PORT: '3001',
    DEMO_MODE: 'true',
  };

  // Try .env, fall back to .env.example
  for (const name of ['.env', '.env.example']) {
    const p = path.join(__dirname, '..', name);
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (val) defaults[key] = val;
    }
    break;
  }

  return {
    GEMINI_API_KEY: defaults.GEMINI_API_KEY,
    GEMINI_MODEL: defaults.GEMINI_MODEL,
    TRELLO_API_KEY: defaults.TRELLO_API_KEY,
    TRELLO_TOKEN: defaults.TRELLO_TOKEN,
    TRELLO_LIST_ID: defaults.TRELLO_LIST_ID,
    PORT: parseInt(defaults.PORT, 10) || 3001,
    DEMO_MODE: defaults.DEMO_MODE === 'true',
  };
}

module.exports = loadEnv();
