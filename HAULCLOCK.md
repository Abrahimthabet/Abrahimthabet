# HaulClock

Freight detention tracking platform. Truck drivers check in at facilities; the system tracks when free time expires and computes detention owed.

## Monorepo

- `/backend` — Node.js + Express REST API (Fly.io, Neon Postgres, Clerk JWT auth)
- `/app` — Expo React Native app for drivers (Clerk Expo auth, expo-location)

## Backend

```bash
cd backend
cp .env.example .env   # DATABASE_URL, CLERK_SECRET_KEY, DETENTION_HOURLY_RATE
npm install
npm run migrate        # creates tables in Neon
npm run dev            # starts on PORT (default 8080)
```

Deploy to Fly.io:

```bash
cd backend
fly launch                                       # first time only
fly secrets set DATABASE_URL=... CLERK_SECRET_KEY=...
fly deploy
```

### Routes

| Method | Path | Purpose |
|---|---|---|
| POST | `/loads` | Create a new load |
| POST | `/loads/:id/checkin` | Record arrival (timestamp + GPS) |
| GET  | `/loads/:id` | Load + detention status |
| GET  | `/loads/driver/:clerk_id` | All loads for a driver |

All routes require a Clerk session JWT in `Authorization: Bearer <token>`.

### Schema

- `users` (id, clerk_id, role enum['driver','broker','shipper'], name, email, created_at)
- `loads` (id, load_number, driver_id, broker_email, facility_name, appointment_time, created_at)
- `arrival_events` (id, load_id, arrived_at, latitude, longitude)
- `detention_records` (id, load_id, detention_started_at, detention_ended_at, hours_detained, total_owed, status enum['pending','approved','disputed','paid'])

Free time = 2 hours from arrival. Detention billed at `DETENTION_HOURLY_RATE` (default $75/hr).

## App

```bash
cd app
cp .env.example .env   # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
npm install
npx expo start
```

Screens: Login → Home (active loads) → New Load → I'm Here (check-in w/ GPS) → Detention Clock → History.
