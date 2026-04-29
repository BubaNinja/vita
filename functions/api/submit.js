export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'POST only' }), { status: 405, headers });
  }

  try {
    const data = await request.json();
    if (!data.name || !data.phone) {
      return new Response(JSON.stringify({ ok: false, error: 'name and phone required' }), { status: 400, headers });
    }

    await env.DB.prepare(
      'INSERT INTO submissions (site, name, phone, doctor, date, time, service, preorder, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))'
    ).bind(
      data.site || 'unknown',
      data.name,
      data.phone,
      data.doctor || '',
      data.date || '',
      data.time || '',
      data.service || '',
      data.preorder || '',
      data.comment || ''
    ).run();

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers });
  }
}
