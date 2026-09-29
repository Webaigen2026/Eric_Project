# Ember & Oak — Hold-for-Pickup Liquor Store

Retail storefront with age gate, catalog, cart, and **hold-for-pickup** orders. Store owners manage products, orders, and settings from `/admin`. Customers pay at the counter — no online payment or delivery in v1.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + Neon Postgres
- Auth.js (NextAuth) credentials for admin

## Setup

```bash
npm install
cp .env.example .env
```

Put your Neon connection strings in `.env`: the pooled URL in `DATABASE_URL` and the direct URL in `DIRECT_URL`.

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.

## Customer accounts

Customers sign in at `/login` (or create an account at `/register`). Registration sends a **6-digit OTP** to their email; they verify at `/verify-email` before signing in.

**Demo customer (already verified):** `customer@example.com` / `customer123`

### Email (OTP)

Set SMTP in `.env` to send real mail:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="Ember & Oak <noreply@example.com>"
```

Without SMTP, the code is printed in the **server console** and shown on the verify page in development.

Checkout requires a customer login. Staff use `/admin/login`.

### Seed admin

- **Email:** `admin@goku.example`
- **Password:** `123456`

## Customer flow

1. Confirm age (21+)
2. Browse / search the catalog
3. Add items to cart
4. Checkout → items go **on hold**
5. Pick up in store and pay at the counter

## Admin flow

- **Overview** — open holds, low stock
- **Orders** — pending → ready → picked up (or cancel to release hold)
- **Products** — CRUD, stock, images
- **Settings** — store name, hours, address, banner

## Stock holds

Available stock = on-hand − quantities on open orders (`pending` / `ready`).  
Marking **picked up** decrements on-hand. **Cancel** releases the hold without changing on-hand.
