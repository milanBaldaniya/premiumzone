# Premium Zone — Client (Next.js)

Customer-facing storefront for luxury watches & premium gadgets.
**Next.js 15 (App Router)** in plain JavaScript — no TypeScript.

## Tech

Next.js 15 · React 19 · Tailwind CSS · Redux Toolkit + RTK Query · React Hook Form ·
Framer Motion · React Icons · React Hot Toast · Next Font · Next Image

## Design system

Shared luxury palette (identical to admin):

| Token      | Value     |
|------------|-----------|
| Primary    | `#0F172A` |
| Secondary  | `#111827` |
| Accent     | `#D4AF37` (gold) |
| Surface    | `#F8FAFC` |
| Ink        | `#111827` |

Playfair Display (headings) + Inter (body). Reusable `.btn-gold`, `.card-luxe`, `.glass`,
`.input-luxe` component classes in `globals.css`.

## Structure

```
src/
├── app/                 App Router pages (home, products, cart, checkout, auth…)
├── components/
│   ├── layout/          Header, Footer
│   ├── home/            Hero, ProductSection
│   ├── product/         ProductCard, ProductGrid
│   ├── ui/              Button, Rating
│   └── auth/            AuthBootstrap
├── store/
│   ├── api/             RTK Query slices (auth, catalog, commerce)
│   ├── slices/          auth, ui
│   ├── store.js
│   └── Providers.jsx
└── lib/                 utils (cn, formatPrice…)
```

RTK Query `baseApi` handles bearer-token injection + silent refresh-token rotation on 401.

## Getting started

```bash
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at the backend
npm install
npm run dev                    # http://localhost:3000
```

Requires the backend running at `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api/v1`).
