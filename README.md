# Wind Shop Marketplace (Next.js)

Маркетплейс игровых предметов Minecraft с валютой **Ары** (алмазная руда), сделанный на:

- Next.js (App Router)
- Tailwind CSS
- lucide-react
- локальная авторизация и заявки на базе `localStorage` (прототип)

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть: `http://localhost:3000`

## Деплой на Vercel

1. Залить проект в GitHub.
2. На Vercel: `Add New -> Project` и выбрать репозиторий.
3. Build command: `npm run build`
4. Output: стандартный Next.js.
5. Node.js version на Vercel: `20+` (в проекте уже задано через `engines`).

> В репозиторий **не** добавляйте `node_modules` и `.next` (они уже в `.gitignore`).

## Структура

```text
app/
  globals.css
  layout.tsx
  page.tsx
  login/page.tsx
  register/page.tsx
  requests/page.tsx
components/
  auth/AuthForm.tsx
  layout/Header.tsx
  layout/MainLayout.tsx
  market/MarketPage.tsx
  market/ProductCard.tsx
  providers/AppStateProvider.tsx
  requests/PurchaseRequestsTable.tsx
  requests/RequestsPage.tsx
lib/
  constants.ts
  market-catalog.ts
  types.ts
```

## Источник цен

Цены и торговые лоты подтягиваются из:

`https://betaop888.github.io/wind.github.io/data/items.json`

Если источник временно недоступен, используется локальный fallback-каталог.
