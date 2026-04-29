// functions/api/submit.js
// Cloudflare Pages Function — принимает заявки со всех сайтов, пишет в D1
// Привязка D1: wrangler.toml → [[d1_databases]] binding = "DB"

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const data = await request.json();

    // Валидация
    if (!data.name || !data.phone) {
      return new Response(JSON.stringify({ ok: false, error: 'Имя и телефон обязательны' }), { status: 400, headers });
    }

    // Записываем в D1
    await env.DB.prepare(
      `INSERT INTO submissions (site, name, phone, doctor, date, time, service, preorder, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
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

// CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
