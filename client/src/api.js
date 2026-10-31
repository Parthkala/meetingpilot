const BASE = '/api';

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}

export const api = {
  health:       ()          => request('GET',   '/health'),
  loadDemo:     ()          => request('POST',  '/demo/load'),
  resetDemo:    ()          => request('POST',  '/demo/reset'),
  demoStatus:   ()          => request('GET',   '/demo/status'),
  meetings:     ()          => request('GET',   '/meetings'),
  meeting:      (id)        => request('GET',   `/meetings/${id}`),
  analyze:      (body)      => request('POST',  '/meetings/analyze', body),
  updateAction: (id, body)  => request('PATCH', `/action-items/${id}`, body),
  sync:         (ids)       => request('POST',  '/sync', { item_ids: ids }),
  kanban:       ()          => request('GET',   '/kanban'),
  timeline:     ()          => request('GET',   '/timeline'),
};
