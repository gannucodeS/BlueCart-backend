# BlueCart Backend (MongoDB Atlas)

This backend replaces the browser-only IndexedDB prototype with a real MongoDB database (Atlas) and a small Express API.

## Folder structure

- `src/config/` — config helpers (DB connection, constants)
- `src/models/` — Mongoose models (`User`, `Product`, `Order`, `Session`)
- `src/middleware/` — auth / admin guards
- `src/routes/` — API routes
- `src/seed/` — admin + initial products seeding

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env`:

Copy `backend/.env.example` → `backend/.env` and set:

- `MONGODB_URI` to your Atlas connection string
- `PORT` (optional, defaults to 3000)

3. Run:

```bash
npm run dev
```

Then open:

- `http://localhost:3000/login.html`

## Troubleshooting: `querySrv ECONNREFUSED _mongodb._tcp...`

That error means Node could not resolve the **SRV DNS record** used by `mongodb+srv://` (not your password). Common causes:

1. **DNS / network** — Try setting Windows DNS to `8.8.8.8` and `8.8.4.4`, or `1.1.1.1`, then retry.
2. **Firewall / VPN / school network** — May block SRV or MongoDB ports; try another network or disable VPN briefly.
3. **Use Atlas “Standard connection string”** — In Atlas: **Connect → Drivers →** copy the string that starts with `mongodb://` (lists hostnames and ports), not `mongodb+srv://`. Put that full string in `MONGODB_URI` in `.env`.

Optional: test only the DB connection (uses `.env`, no secrets in code):

```bash
node scripts/test-connection.js
```

## API (high level)

All API routes are under `/api`:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/session` (Bearer token)
- `POST /api/auth/logout` (Bearer token)

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products/admin/save` (admin)
- `DELETE /api/products/admin/:id` (admin)

- `GET /api/users/admin/all` (admin)
- `DELETE /api/users/admin/:id` (admin)

- `POST /api/orders` (logged-in user)
- `GET /api/orders` (admin = all, user = own)
- `GET /api/orders/:id` (admin or owner)
- `PATCH /api/orders/admin/:id/status` (admin)
- `DELETE /api/orders/admin/:id` (admin)

- `GET /api/stats/admin/dashboard` (admin)
