// All calls to the Spring Boot backend are here.
// "/api" is a RELATIVE url: the browser sends it to the page's own server (nginx, port 3000),
// and nginx forwards it to the backend container. No host name is hard-coded.
const API = '/api/joinees';

// Every call returns { ok, status, data } so the components can show the real backend response.
async function call(url, options) {
  console.log('[API] request ->', options?.method || 'GET', url);
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: 'Unexpected response from server' }; }
    console.log('[API] response <-', response.status, data);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('[API] network error', error);
    return { ok: false, status: 0, data: { message: 'Cannot reach the server' } };
  }
}

// POST /api/joinees
export function registerJoinee(joinee) {
  return call(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(joinee),
  });
}

// GET /api/joinees/{psId}
export function getJoinee(psId) {
  return call(`${API}/${encodeURIComponent(psId.trim())}`);
}
