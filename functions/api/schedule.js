// functions/api/schedule.js
// GET: return schedule, POST: toggle slot active/inactive

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Auth
  const token = url.searchParams.get('token') || '';
  if (request.method === 'POST') {
    const body = await request.json();
    if ((body.token || token) !== (env.ADMIN_TOKEN || 'changeme')) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });
    }

    // Toggle slot
    if (body.action === 'toggle') {
      const existing = await env.DB.prepare(
        "SELECT id, active FROM doctor_schedule WHERE doctor = ? AND weekday = ? AND slot = ?"
      ).bind(body.doctor, body.weekday, body.slot).first();

      if (existing) {
        await env.DB.prepare("UPDATE doctor_schedule SET active = ? WHERE id = ?")
          .bind(existing.active ? 0 : 1, existing.id).run();
      } else {
        await env.DB.prepare("INSERT INTO doctor_schedule (doctor, weekday, slot, active) VALUES (?, ?, ?, 1)")
          .bind(body.doctor, body.weekday, body.slot).run();
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Unknown action' }), { status: 400, headers });
  }

  // GET - return full schedule
  if (token !== (env.ADMIN_TOKEN || 'changeme')) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });
  }

  try {
    const result = await env.DB.prepare(
      "SELECT doctor, weekday, slot, active FROM doctor_schedule ORDER BY doctor, weekday, slot"
    ).all();

    return new Response(JSON.stringify({ ok: true, data: result.results || [] }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers });
  }
}
