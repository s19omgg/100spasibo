# Telegram bot webhook

Здесь лежат два варианта webhook для автоответа бота 100spasibo на команду `/start`.

## Рекомендованный вариант: Google Apps Script

Для текущей задачи Apps Script проще:

- бесплатно в рамках лимитов Google;
- не нужен отдельный сервер;
- код можно вставить прямо в редактор Google;
- удобно быстро менять текст приветствия.

Файлы:

- `apps-script/Code.gs`;
- `apps-script/README.md`.

Что делает бот:

- принимает Telegram webhook;
- на `/start` отправляет приветственное сообщение;
- показывает кнопки:
  - `Открыть 100spasibo`;
  - `Написать в поддержку`.

Инструкция: `apps-script/README.md`.

## Альтернатива: Cloudflare Worker

Worker можно оставить как запасной вариант, если позже понадобится больше контроля над webhook, заголовками и логами.

Файлы:

- `worker.js`;
- `wrangler.toml.example`.

Короткий порядок запуска Worker:

```bash
cd telegram-bot
cp wrangler.toml.example wrangler.toml
npx wrangler login
npx wrangler secret put BOT_TOKEN
npx wrangler secret put TELEGRAM_SECRET_TOKEN
npx wrangler deploy
```

Затем подключить webhook:

```bash
curl "https://api.telegram.org/bot<ТОКЕН_БОТА>/setWebhook" \
  -d "url=https://<АДРЕС_WORKER>.workers.dev/webhook" \
  -d "secret_token=<ТАКАЯ_ЖЕ_СТРОКА_КАК_TELEGRAM_SECRET_TOKEN>"
```
