export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '';
    if (!path || !path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid path' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let body = {};
    try {
      body = await req.json();
    } catch (e) {}

    const envKey =
      process.env.UW_API_KEY ||
      process.env.UNUSUAL_WHALES_API_KEY ||
      process.env.UW_KEY ||
      '';

    const key = (body && body.key) || envKey;
    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing UW API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const upstream = 'https://api.unusualwhales.com' + path;
    const upstreamRes = await fetch(upstream, {
      headers: {
        'Authorization': 'Bearer ' + key,
        'UW-CLIENT-API-ID': '100001',
        'Accept': 'application/json'
      }
    });

    const text = await upstreamRes.text();
    return new Response(text, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err && err.message ? err.message : 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
