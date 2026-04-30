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

Контакт поддержки внутри мини-приложения: `https://t.me/stospasibo?direct`.

## Админка и заявки

Поток заявок устроен так:

1. Пользователь отправляет форму в мини-приложении.
2. Заявка сохраняется в таблицу Supabase `applications` со статусом `new`.
3. Админ открывает `/admin`, видит новые заявки и нажимает `Опубликовать`.
4. Статус меняется на `published`, и заявка появляется в каталоге мини-приложения.

Чтобы включить живой режим:

1. Создать проект в Supabase.
2. Открыть SQL Editor и выполнить `supabase/schema.sql`.
3. В GitHub repo settings -> Secrets and variables -> Actions добавить:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Запустить новый деплой GitHub Pages.

Без этих переменных мини-приложение работает в демо-режиме: заявки сохраняются только в `localStorage` текущего браузера.

## Структура

- `src/data/requests.ts` - mock data заявок.
- `src/components/ui.tsx` - общие компоненты интерфейса.
- `src/App.tsx` - страницы и SPA-маршрутизация.
- `src/styles.css` - визуальная система и адаптив.
