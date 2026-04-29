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
    // Get doctor schedule (working hours)
    const schedResult = await env.DB.prepare(
      "SELECT doctor, weekday, slot FROM doctor_schedule WHERE active = 1 ORDER BY doctor, weekday, slot"
    ).all();

    // Get booked slots (no personal data)
    const bookedResult = await env.DB.prepare(
      "SELECT doctor, date, time FROM submissions WHERE status != 'cancelled' ORDER BY created_at DESC LIMIT 500"
    ).all();

    const schedule = (schedResult.results || []).map(r => ({
      doctor: r.doctor,
      weekday: r.weekday,
      slot: r.slot
    }));

    const booked = (bookedResult.results || []).map(r => ({
      doctor: r.doctor || '',
      date: r.date || '',
      time: r.time || ''
    })).filter(s => s.doctor && s.date && s.time);

    return new Response(JSON.stringify({ ok: true, schedule, booked }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: true, schedule: [], booked: [] }), { status: 200, headers });
  }
}
