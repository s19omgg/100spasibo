var WEB_APP_URL_FALLBACK = "https://s19omgg.github.io/100spasibo/";
var TELEGRAM_SUPPORT_URL = "https://t.me/stospasibo?direct";

function doGet() {
  return json_({
    ok: true,
    service: "100spasibo Telegram bot",
    mode: "Google Apps Script",
  });
}

function doPost(e) {
  var configuredSecret = getProperty_("WEBHOOK_SECRET");
  var requestSecret = e && e.parameter ? e.parameter.secret : "";

  if (configuredSecret && requestSecret !== configuredSecret) {
    return json_({ ok: false, error: "Unauthorized" });
  }

  var update = parseUpdate_(e);
  if (isDuplicateUpdate_(update)) {
    return json_({ ok: true, duplicate: true });
  }

  var chatId = update && update.message && update.message.chat ? update.message.chat.id : null;

  if (chatId && isStartCommand_(update)) {
    sendStartMessage_(chatId);
  }

  return json_({ ok: true });
}

function setWebhook() {
  var token = getRequiredProperty_("BOT_TOKEN");
  var webAppUrl = getRequiredProperty_("WEBHOOK_URL");
  var secret = getRequiredProperty_("WEBHOOK_SECRET");
  var webhookUrl = webAppUrl + "?secret=" + encodeURIComponent(secret);

  return telegramRequest_("setWebhook", {
    url: webhookUrl,
    drop_pending_updates: true,
  }, token);
}

function deleteWebhook() {
  return telegramRequest_("deleteWebhook", {
    drop_pending_updates: true,
  }, getRequiredProperty_("BOT_TOKEN"));
}

function getWebhookInfo() {
  return telegramRequest_("getWebhookInfo", {}, getRequiredProperty_("BOT_TOKEN"));
}

function sendStartMessage_(chatId) {
  var webAppUrl = getProperty_("WEB_APP_URL") || WEB_APP_URL_FALLBACK;
  var text = [
    "Привет! Это 100spasibo.",
    "",
    "Здесь люди помогают людям напрямую: можно посмотреть проверенные заявки, поддержать конкретного человека или узнать, как подать свою заявку.",
    "",
    "Нажмите кнопку ниже, чтобы открыть платформу.",
  ].join("\n");

  return telegramRequest_("sendMessage", {
    chat_id: chatId,
    text: text,
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
            url: TELEGRAM_SUPPORT_URL,
          },
        ],
      ],
    },
  }, getRequiredProperty_("BOT_TOKEN"));
}

function isStartCommand_(update) {
  var text = update && update.message && update.message.text ? String(update.message.text).trim() : "";
  return text === "/start" || text.indexOf("/start ") === 0;
}

function isDuplicateUpdate_(update) {
  var updateId = update && update.update_id;
  if (updateId === null || updateId === undefined) return false;

  var key = "telegram_update_" + updateId;
  var cache = CacheService.getScriptCache();
  if (cache.get(key)) return true;

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(1000);
    if (cache.get(key)) return true;
    cache.put(key, "1", 21600);
    return false;
  } finally {
    try {
      lock.releaseLock();
    } catch (error) {}
  }
}

function parseUpdate_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function telegramRequest_(method, payload, token) {
  var response = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  var text = response.getContentText();
  var data = text ? JSON.parse(text) : {};

  if (response.getResponseCode() >= 400 || data.ok === false) {
    throw new Error("Telegram API error: " + text);
  }

  return data;
}

function getProperty_(name) {
  return PropertiesService.getScriptProperties().getProperty(name);
}

function getRequiredProperty_(name) {
  var value = getProperty_(name);
  if (!value) throw new Error("Script property is missing: " + name);
  return value;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
