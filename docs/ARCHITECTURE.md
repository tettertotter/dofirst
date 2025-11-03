# Architecture

- Database: Supabase Postgres with RLS.
- Auth: Supabase Auth with email magic links.
- Realtime: Supabase realtime for proposal updates.
- Web: Next.js 15 (App Router).
- Mobile: Expo Router (React Native). Shared UI via react-native-web.
- Email: Resend outbound, Mailgun inbound to Supabase Edge Function.
- Hosting: Vercel for web. Supabase for DB and functions. Expo for mobile builds.

Key design choices:
- RLS enforces visibility and membership at the database layer.
- Monorepo with Turborepo to share types and UI.
- Edge function terminates Mailgun webhooks and creates tasks with safe defaults.
