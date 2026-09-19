# Worker واسط Telegram برای WooCommerce Telegram Store Pro

این Worker برای زمانی است که هاست وردپرس نمی‌تواند مستقیماً به `api.telegram.org` وصل شود.

## راه‌اندازی روی Deno Deploy

1. وارد Deno Deploy شوید و یک اپلیکیشن جدید بسازید.
2. فایل `main.ts` را به عنوان ورودی Worker قرار دهید.
3. در Environment Variables یک متغیر بسازید:

`RELAY_SECRET=یک-کلید-طولانی-و-تصادفی`

4. Deploy کنید.
5. آدرس Worker را به شکل زیر در افزونه وارد کنید:

`https://YOUR-WORKER-DOMAIN/telegram`

6. همان مقدار `RELAY_SECRET` را در قسمت «کلید مشترک Worker» افزونه وارد کنید.
7. ذخیره تنظیمات را بزنید و سپس «اتصال خودکار ربات و Webhook» را اجرا کنید.

## تست

آدرس زیر باید JSON زیر را برگرداند:

`https://YOUR-WORKER-DOMAIN/health`

`{"ok":true,"service":"wctsp-telegram-relay"}`

توکن ربات داخل Worker ذخیره نمی‌شود؛ افزونه در هر درخواست آن را از طریق HTTPS برای Worker می‌فرستد و Worker فقط همان درخواست را به Telegram Bot API منتقل می‌کند.
