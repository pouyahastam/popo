/**
 * WCTSP Telegram Relay - Deno Deploy
 * Endpoint: POST /telegram
 * Body: { token: string, method: string, params: object }
 * Header: X-Relay-Secret: <RELAY_SECRET>
 */

const SECRET = Deno.env.get('RELAY_SECRET') ?? '';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === 'GET' && url.pathname === '/health') {
    return json({ ok: true, service: 'wctsp-telegram-relay' });
  }

  if (req.method !== 'POST' || url.pathname !== '/telegram') {
    return json({ ok: false, error: 'Not found' }, 404);
  }

  if (SECRET && req.headers.get('x-relay-secret') !== SECRET) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const token = String(body?.token ?? '').trim();
    const method = String(body?.method ?? '').trim();
    const params = body?.params && typeof body.params === 'object' ? body.params : {};

    if (!token || !method || !/^[A-Za-z0-9_]+$/.test(method)) {
      return json({ ok: false, error: 'Invalid request' }, 400);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const tg = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/${method}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      const text = await tg.text();
      let data: unknown;
      try { data = JSON.parse(text); } catch { data = { ok: false, error: text }; }
      return json(data, tg.status);
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Relay error';
    return json({ ok: false, error: message }, 502);
  }
});
