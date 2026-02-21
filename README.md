# Wind Shop Marketplace (Online, Shared for All Players)

Next.js marketplace for Minecraft items with:
- English registration/login (`username + password`)
- Shared online purchase requests (all users see same board)
- `Take / Release / Complete / Cancel` workflow
- Player profiles with stats and editable bio
- Prices merged from `https://betaop888.github.io/wind.github.io/data/items.json`

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Lucide-react
- Prisma + PostgreSQL (required for shared online state)

## 1) Loцcal setup

```bash
npm install
cp .env.example .env
```

Set `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
SESSION_COOKIE_NAME="wind_session"
```

Create/update DB schema:

```bash
npm run db:push
```

Run:

```bash
npm run dev
```

## 2) Deploy GitHub -> Vercel (without issues)

1. Push full project to GitHub (`node_modules` and `.next` are ignored).
2. Import repo in Vercel as **Next.js** project.
3. In Vercel Project Settings -> Environment Variables add:
   - `DATABASE_URL`
   - `SESSION_COOKIE_NAME` (optional, default is `wind_session`)
4. Deploy. `vercel.json` already runs `npm run db:push && npm run build`, so schema is synced on build automatically.

## Core routes

- `/` - Market page
- `/login` - Login
- `/register` - Registration (English)
- `/requests` - Shared live requests board
- `/profile/[username]` - Public profile + own bio editing

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/requests?status=active|all`
- `POST /api/requests`
- `POST /api/requests/:id/claim`
- `POST /api/requests/:id/release`
- `POST /api/requests/:id/complete`
- `POST /api/requests/:id/cancel`
- `GET /api/profiles/:username`
- `GET/PATCH /api/profiles/me`
