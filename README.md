# DevTrack AI — Developer Work Journal

Log your daily engineering work in **any language** (English, Hindi, Gujarati, Hinglish, or a mix). Claude detects the language, rewrites it into professional English, extracts tasks / learnings / challenges / technologies, and builds **weekly, monthly, and yearly reports** you can export and have emailed automatically.

Built with **Next.js 15 · TypeScript · Tailwind CSS · shadcn-style UI · MongoDB Atlas · Clerk · Claude (Anthropic) · Resend · Vercel**.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
#    then fill in real values (see "Environment" below)

# 3. Run
npm run dev          # http://localhost:3000
```

Type-check and build:

```bash
npm run typecheck
npm run build
```

---

## Environment

Copy `.env.example` → `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) — create a cluster + DB user, allow your IP. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | [Clerk dashboard](https://dashboard.clerk.com). |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com). Model defaults to `claude-opus-4-8`. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | [Resend](https://resend.com) — verify a sending domain. |
| `CRON_SECRET` | Any long random string; used to protect the cron routes. |

The app degrades gracefully when keys are missing — pages render a friendly "configure your environment" message instead of crashing.

---

## How it works

```
You type (any language)
        │
        ▼
 Claude structured output  ──►  { summary, tasks, achievements, learnings, challenges, technologies, languages }
        │
        ▼
   JournalEntry (MongoDB)
        │
        ├─►  Weekly report   (Mon–Fri rows + AI summary)   ──►  PDF · Excel · CSV · Markdown
        ├─►  Monthly report  (aggregate + AI analysis)      ──►  PDF · Excel · Markdown
        └─►  Analytics       (projects, tech, trends)
```

- **AI layer** — `src/lib/ai/` uses the Anthropic SDK with `messages.parse()` + Zod schemas (`zodOutputFormat`) so every result matches our type, with adaptive thinking enabled.
- **Reports** — `src/lib/reports/build.ts` combines a week/month of entries and asks Claude for a manager- and appraisal-ready summary.
- **Exports** — `src/app/api/export/*` stream PDF (`@react-pdf/renderer`), Excel (`exceljs`, 4 sheets), CSV, and Markdown.
- **Email** — `src/lib/email/` sends reports through Resend and logs every send to the `EmailLogs` collection.

---

## Project structure

```
src/
  app/
    (public)            page.tsx (landing), sign-in, sign-up
    dashboard/          dashboard, journal, reports, analytics, settings
    api/
      export/           weekly/[id], monthly/[id], yearly
      cron/             weekly, monthly
  actions/              journal.ts, reports.ts, settings.ts (server actions)
  components/
    ui/                 shadcn-style primitives
    dashboard/ journal/ reports/ analytics/ settings/
  lib/
    ai/  mongodb/  email/  pdf/  excel/  export/  reports/  analytics/  cron/
  models/               User, JournalEntry, WeeklyReport, MonthlyReport, EmailLog
  types/                shared DTOs
```

---

## Automated emails (cron)

`vercel.json` schedules two cron jobs:

- **Weekly** — `/api/cron/weekly`, every Friday 18:00.
- **Monthly** — `/api/cron/monthly`, daily at 18:30; the route only sends on the last day of the month.

Vercel automatically sends `Authorization: Bearer $CRON_SECRET`. To trigger manually:

```bash
curl -H "x-cron-secret: $CRON_SECRET" https://your-app.vercel.app/api/cron/weekly
curl -H "x-cron-secret: $CRON_SECRET" "https://your-app.vercel.app/api/cron/monthly?force=1"
```

> Note: Vercel's Hobby plan limits crons to once per day. The schedules above fit that limit; on Pro you can tighten them.

---

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add all environment variables from `.env.example` in **Project Settings → Environment Variables**.
3. Deploy. Cron jobs register automatically from `vercel.json`.

---

## Roadmap (scaffolded for future work)

Voice journal entry · AI career coach · GitHub integration · learning tracker · yearly engineering review · AI productivity insights.
