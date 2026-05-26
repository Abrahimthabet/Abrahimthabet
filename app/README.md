# HaulClock App

Expo React Native app for truck drivers to log loads and track detention.

## Setup

```bash
cp .env.example .env
# EXPO_PUBLIC_API_URL = backend base URL (e.g. https://haulclock-api.fly.dev)
# EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = Clerk publishable key
npm install
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Screens

- **Login** — Clerk email/password sign-in
- **Home** — list of active loads, pull-to-refresh
- **New Load** — create a load (load number, facility, appointment, broker email)
- **Check In** — large "I'M HERE" button; captures GPS via `expo-location`
- **Detention Clock** — counts down 2-hour free time (green), flips to detention timer (red) with live $ owed
- **History** — past loads with status badges (pending / approved / disputed / paid)

## Notes

- Auth: Clerk Expo, JWT sent on every API call via `Authorization: Bearer …`
- Networking: thin `fetch` wrapper at `src/lib/api.js`, base URL from `EXPO_PUBLIC_API_URL`
- Secure token storage: `expo-secure-store` via Clerk's `tokenCache`
