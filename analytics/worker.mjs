const ORIGINS = new Set(['https://studiovangeene.nl', 'https://www.studiovangeene.nl']);
const SEGMENTS = new Set(['all', 'home', 'technical', 'interior']);
const EVENTS = new Set(['page_view', 'project_view', 'contact_click', 'segment_select']);
// Only structured, bounded fields are stored. No IPs, user agents or referrers.
async function readSmallJSON(request) {
  if (!request.body) throw new Error('body');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) { await reader.cancel(); throw new Error('size'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const headers = { 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    if (!ORIGINS.has(origin)) return new Response(null, { status: 403, headers });
    headers['Access-Control-Allow-Origin'] = origin;
    if (new URL(request.url).pathname !== '/collect') return new Response(null, { status: 404, headers });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      ...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type'
    } });
    if (request.method !== 'POST') return new Response(null, { status: 405, headers });
    let data;
    try { data = await readSmallJSON(request); } catch (_) { return new Response(null, { status: 400, headers }); }
    if (!data || !EVENTS.has(data.event) || !SEGMENTS.has(data.segment)) return new Response(null, { status: 400, headers });
    const project = data.project || '';
    const channel = data.channel || '';
    if (typeof project !== 'string' || !/^[a-z0-9-]{0,96}$/.test(project)) return new Response(null, { status: 400, headers });
    if ((data.event === 'project_view' && !project) ||
        (data.event === 'contact_click' && !['whatsapp', 'email', 'phone'].includes(channel)) ||
        (data.event === 'segment_select' && !SEGMENTS.has(channel)) ||
        (['page_view', 'project_view'].includes(data.event) && channel !== '')) return new Response(null, { status: 400, headers });
    try {
      const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      const result = await env.DB.prepare('INSERT INTO daily_events (day, event, project, segment, channel, total) VALUES (?, ?, ?, ?, ?, 1) ON CONFLICT (day, event, project, segment, channel) DO UPDATE SET total = total + 1').bind(day, data.event, project, data.segment, channel).run();
      if (!result.success) throw new Error('write failed');
    } catch (_) { return new Response(null, { status: 503, headers }); }
    return new Response(null, { status: 204, headers });
  }
};
