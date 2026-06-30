# DevTrack AI — Project Guide for Developer

AI-powered developer work journal. Users log work in any language; the AI translates/rewrites it professionally and builds weekly/monthly/yearly reports with PDF/Excel/CSV/Markdown export and automated email delivery.

## Stack
- Next.js 15 (App Router, RSC, Server Actions) · TypeScript · Tailwind v3 · shadcn-style UI
- MongoDB Atlas via Mongoose · Clerk auth · Anthropic Claude (`claude-opus-4-8`) · Resend · Vercel

## Conventions
- **AI model:** always `claude-opus-4-8` (override via `ANTHROPIC_MODEL`). Use `messages.parse()` + `zodOutputFormat` for structured output; adaptive thinking on. AI code lives in `src/lib/ai/` and must stay server-only.
- **Data flow:** Server Actions in `src/actions/*` are the write path; they call `src/lib/*` helpers, then `revalidatePath`. Page components are `force-dynamic` and fetch via the same actions/lib.
- **Serialization:** never pass Mongoose docs to client components. Convert with `src/lib/serialize.ts` to the DTOs in `src/types/`.
- **Auth:** `requireUserId()` for the Clerk id (throws if signed out); `ensureUser()` upserts the Mongo `User`. The Clerk id is the `userId` on all collections.
- **Resilience:** dashboard/journal/reports/analytics pages wrap data loading in try/catch and render a friendly message when env keys are missing.
- **Server-only modules** import `"server-only"`; do not import them into client components.

## Where things are
- Models: `src/models/` (User, JournalEntry, WeeklyReport, MonthlyReport, EmailLog)
- Report building: `src/lib/reports/build.ts` · Analytics: `src/lib/analytics/compute.ts` · Dashboard: `src/lib/dashboard.ts`
- Exports: `src/app/api/export/{weekly,monthly,yearly}` + `src/lib/{pdf,excel,export}`
- Cron: `src/app/api/cron/{weekly,monthly}` + `src/lib/cron/` (guarded by `CRON_SECRET`)

## Commands
- `npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint`

## Not yet built (scaffolded as future work)
Voice entry, AI career coach, GitHub integration, learning tracker, yearly engineering review, productivity insights, calendar view.
