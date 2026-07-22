# Premium Products Zone — Backend API

Production-ready REST API for a luxury watches & premium gadgets eCommerce platform.
Built with **Node.js + Express + MongoDB (Mongoose)**. Plain JavaScript (ESM), no TypeScript.

## Tech

Express · Mongoose · JWT (access + refresh) · Google OAuth · Cloudinary · Multer ·
Nodemailer · Winston · Helmet · CORS · Rate limiting · Zod validation · Compression

## Architecture

Layered / feature-oriented:

```
src/
├── config/        env validation, db, logger, cloudinary
├── constants/     enums (roles, order/payment status …)
├── models/        Mongoose schemas (14 collections)
├── validators/    Zod request schemas
├── middlewares/   auth, error, validate, rateLimiter, upload
├── services/      business logic (auth, order, pricing, cloudinary, email)
├── controllers/   thin HTTP handlers → services
├── routes/        route definitions, wired in routes/index.js
├── utils/         ApiError, ApiResponse, QueryBuilder, token, cookies
├── seed/          database seeder
├── app.js         express app assembly
└── server.js      bootstrap + graceful shutdown
```

**Request flow:** route → validate (Zod) → auth/authorize → controller → service → model.
All responses share one envelope: `{ success, message, data, meta? }`.

## Getting started

```bash
cp .env.example .env      # fill in secrets (Mongo, JWT, Cloudinary, SMTP, Google)
npm install
npm run seed              # optional: super admin + sample catalog
npm run dev               # http://localhost:5000/api/v1
```

Default seeded admin: **admin@luxe.com / Admin@1234**

## Key endpoints

| Area        | Base path                |
|-------------|--------------------------|
| Auth        | `/api/v1/auth`           |
| Products    | `/api/v1/products`       |
| Categories  | `/api/v1/categories`     |
| Brands      | `/api/v1/brands`         |
| Cart        | `/api/v1/cart`           |
| Wishlist    | `/api/v1/wishlist`       |
| Orders      | `/api/v1/orders`         |
| Coupons     | `/api/v1/coupons`        |
| Reviews     | `/api/v1/reviews`        |
| Analytics   | `/api/v1/analytics`      |
| Upload      | `/api/v1/upload`         |

## Security

Helmet · CORS allow-list · bcrypt password hashing · JWT with rotation ·
mongo-sanitize · HPP · rate limiting (global + strict auth) · httpOnly refresh cookies ·
role-based authorization (`customer` / `admin` / `super_admin`).

## Payments

Cash on Delivery is implemented. `order.paymentResult` and the `PAYMENT_METHOD` enum are
structured so Stripe / Razorpay / PayPal can be added as gateway services without schema changes.
