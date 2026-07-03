# Daily Study Tracker

A personal study planner: add subjects and topics manually, get an auto-generated timetable, track daily progress, and receive browser push reminders.

## Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth)
- **Notifications:** Web Push (`web-push`) + service worker
- **Hosting:** Vercel + Cron Jobs

## Setup (local)

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the contents of `supabase/schema.sql`
3. In **Authentication → Providers**, enable Email
4. Copy your project URL and keys from **Settings → API**

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Put the public key in `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and private key in `VAPID_PRIVATE_KEY`.

Generate a random `CRON_SECRET` (any long random string).

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and start adding subjects.

## How to add a new subject

1. Sign in and tap **Add Subject** (or **+ Add Subject** on the dashboard)
2. Enter the subject name (e.g. "DSA")
3. Add topics one by one (e.g. "Arrays", "Linked Lists")
4. Set duration in days or weeks
5. Set daily study time (defaults from Settings)
6. Optionally set priority (High/Medium/Low)
7. Submit — the app splits topics evenly across your timeline starting today

View the full timetable on the subject detail page. Tap **Edit** on any day to reorder or change topics.

## Daily progress

- **Dashboard** shows today's checklist — tap to mark Done / Not Done
- Progress bars show overall and weekly completion
- **Streak** counts consecutive days with at least one topic completed
- **Heatmap** shows study activity over the last ~13 weeks

## Notifications

1. Go to **Settings**
2. Set your reminder time (default 8:00 PM) and timezone
3. Tap **Enable daily reminders** and allow browser notifications
4. Use **Send test notification** to verify

The Vercel Cron job hits `/api/cron/remind` every minute and sends a push when your local reminder time matches (once per day per user).

**Vercel Hobby note:** Cron on the free Hobby plan may only run once per day. For exact custom reminder times on free tier, use [cron-job.org](https://cron-job.org) to call your deployed URL every minute:

```
GET https://your-app.vercel.app/api/cron/remind
Authorization: Bearer YOUR_CRON_SECRET
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local.example`
4. Deploy — `vercel.json` configures the cron job automatically
5. After deploy, sign up on the live URL and enable notifications

## Add to Home Screen (phone)

### iPhone (Safari)

1. Open your deployed app URL in Safari
2. Tap the **Share** button
3. Tap **Add to Home Screen**
4. Open the app from your home screen and enable notifications in Settings

### Android (Chrome)

1. Open the app in Chrome
2. Tap the menu (⋮) → **Install app** or **Add to Home screen**
3. Enable notifications in the app Settings page

Once installed as a PWA and notifications are enabled, reminders work even when the browser tab is closed.

## Project structure

```
src/
  app/           # Pages and API routes
  components/    # UI components
  lib/           # Supabase clients, timetable logic, progress helpers
public/
  sw.js          # Service worker for push notifications
  manifest.json  # PWA manifest
supabase/
  schema.sql     # Database schema + RLS policies
```

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/subjects` | Create subject + auto-generate timetable |
| `PUT /api/subjects/[id]/timetable` | Edit a day's topics |
| `POST /api/topics/[id]/toggle` | Mark topic done/undone |
| `POST /api/push/subscribe` | Save push subscription |
| `POST /api/push/test` | Send test notification |
| `GET /api/cron/remind` | Daily reminder cron (Bearer CRON_SECRET) |
| `PUT /api/settings` | Update reminder time & study minutes |
