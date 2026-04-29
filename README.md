# 100spasibo

React + TypeScript MVP для теплого Telegram Mini App платформы взаимопомощи.

## Команды

- `npm run dev` - локальный dev-сервер.
- `npm run build` - проверка TypeScript и production-сборка.
- `npm run preview` - локальный preview production-сборки.

## Маршруты

- `/` - главная.
- `/requests` - каталог заявок.
- `/requests/anna` - пример страницы заявки.
- `/apply` - форма подачи заявки.
- `/how-it-works` - как работает платформа.
- `/safety` - безопасность и дисклеймеры.
- `/faq` - вопросы и ответы.
- `/admin` - закрытая демо-админка.

## Telegram Mini App

Публичный URL для BotFather:

`https://s19omgg.github.io/100spasibo/`

Что сделать в Telegram:

1. Создать бота через `@BotFather`.
2. Открыть `@BotFather` -> `/setmenubutton`.
3. Выбрать бота.
4. Указать текст кнопки, например `Открыть 100spasibo`.
5. Указать Web App URL: `https://s19omgg.github.io/100spasibo/`.

Контакт поддержки внутри мини-приложения: `https://t.me/100spasibo`.

## Структура

- `src/data/requests.ts` - mock data заявок.
- `src/components/ui.tsx` - общие компоненты интерфейса.
- `src/App.tsx` - страницы и SPA-маршрутизация.
- `src/styles.css` - визуальная система и адаптив.
