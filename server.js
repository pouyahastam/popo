const http = require('http');

const PORT = Number(process.env.PORT || 10000);
const SECRET = String(process.env.RELAY_SECRET || '');

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function allowedMethod(method) {
  return /^[A-Za-z0-9_]+$/.test(method);
}

const server = http.createServer((req, res) => {

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, {
      ok: true,
      service: 'wctsp-telegram-relay'
    });
  }

  if (req.method !== 'POST' || req.url !== '/telegram') {
    return send(res, 404, {
      ok: false,
      error: 'Not found'
    });
  }

  if (!SECRET || req.headers['x-relay-secret'] !== SECRET) {
    return send(res, 401, {
      ok: false,
      error: 'Unauthorized'
    });
  }

  let raw = '';

  req.on('data', chunk => {
    raw += chunk;

    if (raw.length > 1024 * 1024) {
      req.destroy();
    }
  });

  req.on('end', () => {

    try {

      const body = JSON.parse(raw || '{}');

      const token = String(body.token || '').trim();
      const method = String(body.method || '').trim();

      const params =
        body.params && typeof body.params === 'object'
          ? body.params
          : {};

      if (!token || !allowedMethod(method)) {
        return send(res, 400, {
          ok: false,
          error: 'Invalid request'
        });
      }

      /*
       * وردپرس نباید منتظر Telegram بماند.
       * ابتدا درخواست را قبول می‌کنیم.
       */
      send(res, 202, {
        ok: true,
        queued: true,
        message: 'Request accepted by relay'
      });

      /*
       * سپس ارسال واقعی به Telegram انجام می‌شود.
       */
      (async () => {

        const controller = new AbortController();

        const timer = setTimeout(() => {
          controller.abort();
        }, 25000);

        try {

          const tg = await fetch(
            `https://api.telegram.org/bot${encodeURIComponent(token)}/${method}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(params),
              signal: controller.signal
            }
          );

          const text = await tg.text();

          console.log(
            `[telegram] ${method} HTTP ${tg.status}: ${text.slice(0, 1500)}`
          );

        } catch (e) {

          console.error(
            '[telegram] forwarding failed:',
            e instanceof Error ? e.message : e
          );

        } finally {

          clearTimeout(timer);

        }

      })();

    } catch (e) {

      /*
       * اگر هنوز پاسخ ارسال نشده باشد، خطا را برگردان.
       */
      try {
        send(res, 502, {
          ok: false,
          error: e instanceof Error ? e.message : 'Relay error'
        });
      } catch (_) {}

    }

  });

});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`WCTSP relay listening on ${PORT}`);
});
