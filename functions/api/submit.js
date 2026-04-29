export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

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

    const result = await env.DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ ok: true, data: result.results, count: result.results.length }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers });
  }
}
