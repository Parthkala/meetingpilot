const http = require('http');
const env = require('./env');
const { handleHealth } = require('./routes/health');
const { listMeetings, getMeeting, analyzeMeeting } = require('./routes/meetings');
const { updateActionItem, syncActionItems, getKanban, getTimeline } = require('./routes/actions');
const { loadDemoData, resetDemoData, getDemoStatus } = require('./routes/demo');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.resolve({}); }
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

async function requestListener(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  try {
    // 1. Health
    if (pathname === '/api/health' && method === 'GET') {
      const data = await handleHealth(req, res);
      return sendJson(res, 200, data);
    }

    // 2. Demo routes
    if (pathname === '/api/demo/load' && method === 'POST') {
      const data = await loadDemoData();
      return sendJson(res, 200, data);
    }
    if (pathname === '/api/demo/reset' && method === 'POST') {
      const data = resetDemoData();
      return sendJson(res, 200, data);
    }
    if (pathname === '/api/demo/status' && method === 'GET') {
      const data = getDemoStatus();
      return sendJson(res, 200, data);
    }

    // 3. Meetings routes
    if (pathname === '/api/meetings' && method === 'GET') {
      const data = listMeetings();
      return sendJson(res, 200, data);
    }
    if (pathname.startsWith('/api/meetings/') && pathname !== '/api/meetings/analyze' && method === 'GET') {
      const id = pathname.replace('/api/meetings/', '');
      const data = getMeeting(id);
      if (!data) return sendJson(res, 404, { error: 'Meeting not found' });
      return sendJson(res, 200, data);
    }
    if (pathname === '/api/meetings/analyze' && method === 'POST') {
      const body = await parseJsonBody(req);
      const forceDemo = parsedUrl.searchParams.get('demo') === 'true' ? true : null;
      const data = await analyzeMeeting(body, forceDemo);
      return sendJson(res, 200, data);
    }

    // 4. Action items & Sync
    if (pathname.startsWith('/api/action-items/') && method === 'PATCH') {
      const id = pathname.replace('/api/action-items/', '');
      const body = await parseJsonBody(req);
      const data = updateActionItem(id, body);
      if (!data) return sendJson(res, 404, { error: 'Action item not found' });
      return sendJson(res, 200, data);
    }
    if (pathname === '/api/sync' && method === 'POST') {
      const body = await parseJsonBody(req);
      const data = await syncActionItems(body.item_ids || []);
      return sendJson(res, 200, data);
    }

    // 5. Kanban & Timeline
    if (pathname === '/api/kanban' && method === 'GET') {
      const data = getKanban();
      return sendJson(res, 200, data);
    }
    if (pathname === '/api/timeline' && method === 'GET') {
      const data = getTimeline();
      return sendJson(res, 200, data);
    }

    // 404
    return sendJson(res, 404, { error: `Not found: ${method} ${pathname}` });
  } catch (err) {
    console.error(`[Server Error] ${method} ${pathname}:`, err);
    return sendJson(res, 500, { error: err.message || 'Internal server error' });
  }
}

const server = http.createServer(requestListener);

if (!process.env.VERCEL && require.main === module) {
  const PORT = env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`[MeetingPilot Server] Listening on http://localhost:${PORT}`);
    console.log(`[MeetingPilot Server] Demo Mode: ${env.DEMO_MODE ? 'ENABLED' : 'DISABLED'}`);
  });
}

module.exports = server;
module.exports.requestListener = requestListener;
