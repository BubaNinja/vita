// functions/api/slots.js
// Публичный эндпоинт — возвращает занятые слоты (без персональных данных)

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const result = await env.DB.prepare(
      `SELECT doctor, date, time FROM submissions WHERE status != 'cancelled' ORDER BY created_at DESC LIMIT 500`
    ).all();

    const slots = (result.results || []).map(r => ({
      doctor: r.doctor || '',
      date: r.date || '',
      time: r.time || ''
    })).filter(s => s.doctor && s.date && s.time);

    return new Response(JSON.stringify({ ok: true, slots }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: true, slots: [] }), { status: 200, headers });
  }
}
