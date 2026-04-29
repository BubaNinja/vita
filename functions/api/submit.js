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

    // Check for double-booking (same doctor + date + time)
    if (data.doctor && data.date && data.time) {
      const existing = await env.DB.prepare(
        "SELECT id FROM submissions WHERE doctor = ? AND date = ? AND time = ? AND status != 'cancelled' LIMIT 1"
      ).bind(data.doctor, data.date, data.time).first();

      if (existing) {
        return new Response(JSON.stringify({ ok: false, error: 'slot_taken', message: 'Этот слот уже занят. Выберите другое время.' }), { status: 409, headers });
      }
    }

    await env.DB.prepare(
      "INSERT INTO submissions (site, name, phone, doctor, date, time, service, preorder, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
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
