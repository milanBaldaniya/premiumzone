# Premium Products Zone — Admin Console

Internal admin dashboard for managing the storefront.
**React + Vite** in plain JavaScript — no TypeScript.

## Tech

React 18 · Vite · Ant Design 5 · Redux Toolkit + RTK Query · React Router 7 ·
Recharts · React Icons · Day.js

## Features

- **Auth** — admin/super-admin login (role-gated; customers are rejected)
- **Dashboard** — revenue/orders/customers KPIs + Recharts (area, bar, pie)
- **Products** — list, search, create/edit form, delete, low-stock flags
- **Orders** — list, filter by status, detail view with status timeline & tracking
- **Categories / Brands / Coupons** — full CRUD via modals
- **Customers** — list, search, activate/deactivate
- **Reviews** — moderation (approve / hide)
- **Banners** — CMS hero/promo management
- **Settings** — store, shipping/tax, features, social (super-admin write)

## Design system

Uses the **same luxury palette** as the client via an Ant Design theme token override
(`src/theme/antdTheme.js`): primary `#0F172A`, gold accent `#D4AF37`, surface `#F8FAFC`.

## Structure

```
src/
├── pages/                Dashboard, Products, Orders, Categories, …
├── components/layout/    AdminLayout (sider + header)
├── store/
│   ├── api/              baseApi (+ reauth), adminApi (all endpoints)
│   ├── slices/           authSlice
│   └── store.js
├── theme/                antdTheme.js (shared palette)
├── App.jsx               router + protected routes
└── main.jsx              entry (Provider + ConfigProvider)
```

## Getting started

```bash
cp .env.example .env       # point VITE_API_URL at the backend
npm install
npm run dev                # http://localhost:5173
```

Login with the seeded super admin: **admin@luxe.com / Admin@1234**
(run `npm run seed` in the backend first).
