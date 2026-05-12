# Google Apps Script бот

Рекомендуемый простой вариант для автоответа на `/start`.

## Что делает

- принимает Telegram webhook через `doPost(e)`;
- проверяет секрет в query-параметре `?secret=...`;
- отвечает на `/start`;
- отправляет кнопки `Открыть 100spasibo` и `Написать в поддержку`.

## Настройка

1. Откройте <https://script.google.com/>.
2. Создайте новый проект.
3. Вставьте код из `Code.gs`.
4. Откройте `Project Settings` -> `Script properties`.
5. Добавьте свойства:

| Property | Value |
| --- | --- |
| `BOT_TOKEN` | токен бота из BotFather |
| `WEBHOOK_SECRET` | любая длинная случайная строка |
| `WEB_APP_URL` | `https://s19omgg.github.io/100spasibo/` |

6. Нажмите `Deploy` -> `New deployment`.
7. Тип: `Web app`.
8. `Execute as`: `Me`.
9. `Who has access`: `Anyone`.
10. Скопируйте Web app URL вида `https://script.google.com/macros/s/.../exec`.
11. Добавьте еще одно script property:

| Property | Value |
| --- | --- |
| `WEBHOOK_URL` | Web app URL из пункта 10 |

12. В редакторе Apps Script выберите функцию `setWebhook` и нажмите `Run`.

После этого команда `/start` в боте начнет отправлять приветственное сообщение.

## Проверка

В редакторе Apps Script можно запустить функцию:

```text
getWebhookInfo
```

Если webhook установлен, Telegram вернет объект с вашим URL.

## Важный нюанс

Apps Script Web App не дает удобно читать входящие HTTP-заголовки Telegram, поэтому защита сделана через секретный query-параметр в URL webhook. Для MVP этого достаточно, если секрет длинный и не публикуется.
