// functions/api/list.js
// Получить список заявок. Защита через простой токен в query string.
// Пример: /api/list?token=YOUR_SECRET&site=vita&limit=50

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // Простая авторизация по токену
  const token = url.searchParams.get('token');
  if (token !== (env.ADMIN_TOKEN || 'changeme')) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers });
  }

  const site = url.searchParams.get('site') || '';
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const status = url.searchParams.get('status') || '';

  try {
    let query = 'SELECT * FROM submissions';
    const conditions = [];
    const params = [];

    if (site) { conditions.push('site = ?'); params.push(site); }
    if (status) { conditions.push('status = ?'); params.push(status); }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...params).all();

    return new Response(JSON.stringify({ ok: true, data: result.results, count: result.results.length }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers });
  }
}
