# WCTSP Telegram Relay for Render

Private relay for WooCommerce Telegram Store Pro.

## Render
- Type: Web Service
- Language: Docker
- Root Directory: empty
- Dockerfile Path: `./Dockerfile`
- Build command: leave default
- Start command: leave default
- Free instance: 0.1 CPU / 512 MB
- Environment variable: `RELAY_SECRET` = a long random secret

After deploy, test:
`https://YOUR-SERVICE.onrender.com/health`

Expected:
`{"ok":true,"service":"wctsp-telegram-relay"}`

Then in the WordPress plugin set:
- Server relay URL: `https://YOUR-SERVICE.onrender.com/telegram`
- Worker shared key: the exact same `RELAY_SECRET`

The relay accepts only authenticated requests and forwards Telegram Bot API calls. It is not an open proxy.
