# HaulClock Backend

Node.js + Express API for the HaulClock freight detention platform.

## Stack

- Express
- Neon Postgres (via `pg`)
- Clerk for auth (`@clerk/backend` JWT verification)
- Deployed to Fly.io

## Local development

```bash
cp .env.example .env   # fill in DATABASE_URL, CLERK_SECRET_KEY
npm install
npm run migrate
npm run dev
```

Server runs on `http://localhost:8080`. Health check: `GET /health`.

## Environment variables

| Var | Purpose |
|---|---|
| `PORT` | HTTP port (default 8080) |
| `DATABASE_URL` | Neon Postgres connection string |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `DETENTION_FREE_HOURS` | Free time before detention starts (default 2) |
| `DETENTION_HOURLY_RATE` | $/hr detention rate (default 75) |

## Routes

All routes require `Authorization: Bearer <clerk-session-jwt>`.

- `POST /loads` — body: `{ load_number, broker_email, facility_name, appointment_time }`
- `POST /loads/:id/checkin` — body: `{ latitude, longitude }`
- `GET /loads/:id` — returns `{ load, arrival, detention_record, detention_live }`
- `GET /loads/driver/:clerk_id` — list of loads for the given driver

## Deploy to Fly.io

```bash
fly launch --no-deploy        # uses fly.toml
fly secrets set DATABASE_URL=... CLERK_SECRET_KEY=... CLERK_PUBLISHABLE_KEY=...
fly deploy
```
