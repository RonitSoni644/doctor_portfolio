# Doctors App

Doctor portfolio and admin panel powered by React on the frontend and a local Express API backed by Neon Postgres.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your Neon connection string and admin credentials.
3. Run `npm install`.
4. Run `npm run dev`.

The app starts:

- the API server on `http://localhost:3001`
- the Vite frontend on `http://localhost:5173`

## Environment

- `DATABASE_URL`: Neon Postgres connection string
- `ADMIN_EMAIL`: admin login email for `/admin`
- `ADMIN_PASSWORD`: admin login password
- `SESSION_SECRET`: secret used to sign the admin session cookie
- `PORT`: optional API port, defaults to `3001`
- `VITE_API_BASE_URL`: optional absolute API base URL for deployed frontend builds
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: optional appointment status email settings
