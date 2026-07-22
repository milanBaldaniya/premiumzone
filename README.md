# Premium Products Zone — Premium eCommerce Platform

A production-ready, scalable eCommerce platform for **luxury watches & premium gadgets**.
Three independent repositories that work together seamlessly.

> **Stack note:** entirely **plain JavaScript** (no TypeScript), by project requirement.

```
premium-products-zone/
├── ecommerce-backend/   Node.js + Express + MongoDB REST API
├── ecommerce-client/    Next.js 15 storefront (customer)
├── ecommerce-admin/     React + Vite admin console
└── docker-compose.yml   Mongo + backend for local orchestration
```

## Design language

A shared luxury palette across client **and** admin — modern, minimal, premium.

| Token      | Value                 |
|------------|-----------------------|
| Primary    | `#0F172A` deep slate  |
| Secondary  | `#111827`             |
| Accent     | `#D4AF37` luxury gold |
| Surface    | `#F8FAFC`             |
| Ink        | `#111827`             |

Typography: **Playfair Display** (display) + **Inter** (body). Soft shadows, glassmorphism,
gold gradients, Framer Motion on the storefront.

## Architecture at a glance

```
┌─────────────────┐        ┌─────────────────┐
│  Next.js Client │        │  React Admin    │
│  (port 3000)    │        │  (port 5173)    │
└────────┬────────┘        └────────┬────────┘
         │  RTK Query (Bearer + refresh cookie)│
         └──────────────┬──────────────────────┘
                        ▼
              ┌───────────────────┐
              │  Express REST API │  /api/v1
              │  (port 5000)      │
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐   ┌────────────┐
              │  MongoDB (Mongoose│   │ Cloudinary │
              │  14 collections)  │   │  (images)  │
              └───────────────────┘   └────────────┘
```

**Layered backend:** route → validate (Zod) → auth/authorize → controller → service → model.
Uniform response envelope `{ success, message, data, meta? }`. Central error handling,
Winston logging, rate limiting, Helmet, mongo-sanitize, HPP.

## Feature coverage

**Auth** — JWT access + rotating refresh (httpOnly cookie), Google login, email verification,
forgot/reset password, RBAC (`customer` / `admin` / `super_admin`).

**Storefront** — hero, featured/trending/new/best-seller sections, catalog with search +
filters + sort + pagination, product detail (gallery, specs, related), cart with live pricing
& coupons, COD checkout with address management, auth pages.

**Admin** — dashboard KPIs + Recharts analytics, product CRUD, order lifecycle management with
status timeline, categories/brands/coupons CRUD, customer management, review moderation,
banner CMS, store settings.

**Payments** — Cash on Delivery implemented; Stripe / Razorpay / PayPal architected for
drop-in via gateway services (`PAYMENT_METHOD` enum + `order.paymentResult`).

## Quick start

### 1. Backend
```bash
cd ecommerce-backend
cp .env.example .env          # add Mongo URI, JWT secrets, Cloudinary, SMTP, Google
npm install
npm run seed                  # super admin (admin@luxe.com / Admin@1234) + sample data
npm run dev                   # http://localhost:5000/api/v1
```

### 2. Client
```bash
cd ecommerce-client
cp .env.example .env.local
npm install && npm run dev    # http://localhost:3000
```

### 3. Admin
```bash
cd ecommerce-admin
cp .env.example .env
npm install && npm run dev    # http://localhost:5173
```

### Or with Docker (Mongo + backend)
```bash
cp ecommerce-backend/.env.example ecommerce-backend/.env   # fill secrets
docker compose up --build
```

## Deployment

| Repo     | Recommended host              |
|----------|-------------------------------|
| Backend  | Render / Railway / Fly / Docker |
| Client   | Vercel (Next.js native)       |
| Admin    | Vercel / Netlify (static SPA) |
| Database | MongoDB Atlas                 |
| Images   | Cloudinary                    |

Set each app's environment variables (API URLs, secrets) in the host dashboard. The backend
CORS allow-list reads `CLIENT_URL` and `ADMIN_URL`.

## Code quality

Feature-based structure · service/repository separation · reusable components & hooks ·
absolute imports · ESLint + Prettier · environment validation (fail-fast) · clean architecture.
