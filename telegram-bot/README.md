# Telegram bot webhook

Cloudflare Worker для автоответа бота 100spasibo на команду `/start`.

## Что делает

- принимает webhook от Telegram на `/webhook`;
- проверяет секретный заголовок Telegram, если задан `TELEGRAM_SECRET_TOKEN`;
- на `/start` отправляет приветственное сообщение;
- добавляет кнопки:
  - `Открыть 100spasibo`;
  - `Написать в поддержку`.

## Настройка

1. Скопировать конфиг:

```bash
cd telegram-bot
cp wrangler.toml.example wrangler.toml
```

2. Залогиниться в Cloudflare:

```bash
npx wrangler login
```

3. Добавить токен бота из BotFather:

```bash
npx wrangler secret put BOT_TOKEN
```

4. Добавить секрет для webhook. Можно указать любую длинную случайную строку:

```bash
npx wrangler secret put TELEGRAM_SECRET_TOKEN
```

5. Задеплоить Worker:

```bash
npx wrangler deploy
```

6. Подключить webhook к Telegram:

```bash
curl "https://api.telegram.org/bot<ТОКЕН_БОТА>/setWebhook" \
  -d "url=https://<АДРЕС_WORKER>.workers.dev/webhook" \
  -d "secret_token=<ТАКАЯ_ЖЕ_СТРОКА_КАК_TELEGRAM_SECRET_TOKEN>"
```

После этого команда `/start` в боте будет отправлять приветственное сообщение.
