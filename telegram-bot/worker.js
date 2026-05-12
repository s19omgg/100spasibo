const DEFAULT_WEB_APP_URL = "https://s19omgg.github.io/100spasibo/";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });
}

function isStartCommand(update) {
  const text = update?.message?.text?.trim() ?? "";
  return text === "/start" || text.startsWith("/start ");
}

async function sendTelegramMessage(env, chatId) {
  const webAppUrl = env.WEB_APP_URL || DEFAULT_WEB_APP_URL;
  const text = [
    "Привет! Это 100spasibo.",
    "",
    "Здесь люди помогают людям напрямую: можно посмотреть проверенные заявки, поддержать конкретного человека или узнать, как подать свою заявку.",
    "",
    "Нажмите кнопку ниже, чтобы открыть платформу.",
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Открыть 100spasibo",
              web_app: { url: webAppUrl },
            },
          ],
          [
            {
              text: "Написать в поддержку",
              url: "https://t.me/stospasibo?direct",
            },
          ],
        ],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API error: ${response.status} ${errorText}`);
  }
}

async function handleTelegramUpdate(request, env) {
  if (!env.BOT_TOKEN) {
    return json({ ok: false, error: "BOT_TOKEN is not configured" }, { status: 500 });
  }

  if (env.TELEGRAM_SECRET_TOKEN) {
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== env.TELEGRAM_SECRET_TOKEN) {
      return json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const update = await request.json();
  const chatId = update?.message?.chat?.id;

  if (chatId && isStartCommand(update)) {
    await sendTelegramMessage(env, chatId);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      return json({
        ok: true,
        service: "100spasibo Telegram bot",
        webhook: "/webhook",
      });
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      return handleTelegramUpdate(request, env);
    }

    return json({ ok: false, error: "Not found" }, { status: 404 });
  },
};
