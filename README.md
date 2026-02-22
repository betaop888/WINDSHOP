# WIND Shop Marketplace

Маркетплейс предметов Minecraft для приватного сервера WIND.

## Что реализовано

- Авторизация только через Discord OAuth2.
- Ник на сайте автоматически синхронизируется с Discord.
- Общая онлайн-доска заявок на покупку (`взяться / вернуть / завершить / отменить`).
- Каталог предметов с ценами в валюте **Ары**.
- Базовые предметы + пользовательские товары.
- Зарегистрированные пользователи могут публиковать свои товары:
  - название
  - описание
  - категория
  - цена
  - картинка (URL или загрузка файла)
- Профили игроков:
  - статистика сделок
  - успешные сделки
  - отзывы
- Админ-функции:
  - пользователь `nertin0` получает роль `ADMIN`
  - админ может банить/разбанивать пользователей
  - админ может редактировать/удалять любые товары

## Стек

- Next.js 14 (App Router)
- Tailwind CSS
- Lucide React
- Prisma + PostgreSQL

## Локальный запуск

```bash
npm install
```

Создай `.env` на основе `.env.example` и заполни переменные:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
SESSION_COOKIE_NAME="wind_session"
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/discord/callback"
# PRISMA_DB_PUSH_ACCEPT_DATA_LOSS="false"
```

Синхронизация схемы БД:

```bash
npm run db:push
```

Запуск:

```bash
npm run dev
```

## Деплой GitHub -> Vercel

1. Залей весь проект в GitHub (без `node_modules` и `.next`).
2. Импортируй репозиторий в Vercel как Next.js проект.
3. В `Project Settings -> Environment Variables` добавь:
   - `DATABASE_URL` (или подключи Vercel Postgres)
   - `SESSION_COOKIE_NAME` (опционально)
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI` (например `https://your-domain.vercel.app/api/auth/discord/callback`)
   - `PRISMA_DB_PUSH_ACCEPT_DATA_LOSS` (опционально: `true`/`false`)
4. Деплой.

`buildCommand` использует `npm run db:push && npm run build`.
Если `DATABASE_URL` не задан, `db:push` будет пропущен (с предупреждением), чтобы сборка не падала.
На Vercel `db:push` по умолчанию запускается с `--accept-data-loss` (если переменная не задана).

## Основные маршруты

- `/` — маркет
- `/login` — вход через Discord
- `/requests` — заявки на покупку
- `/profile/[username]` — профиль игрока

## Основные API

- `GET /api/auth/discord`
- `GET /api/auth/discord/callback`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/listings`
- `POST /api/listings`
- `PATCH /api/listings/:id`
- `DELETE /api/listings/:id`
- `GET /api/requests?status=active|all`
- `POST /api/requests`
- `POST /api/requests/:id/claim`
- `POST /api/requests/:id/release`
- `POST /api/requests/:id/complete`
- `POST /api/requests/:id/cancel`
- `GET /api/profiles/:username`
- `GET/PATCH /api/profiles/me`
- `GET/POST /api/profiles/:username/reviews`
- `POST /api/admin/users/:username/ban`
