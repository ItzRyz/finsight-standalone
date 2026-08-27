# FinSight — AI-Powered Financial Command Center

Personal finance tracker: expenses & income, budgets (monthly/yearly with thresholds), categories (system + custom + local-keyword AI auto-categorization), real-time budget alerts/notifications, admin analytics, CSV export, PWA offline.

**Stack:** Next.js 16.3 (App Router, `src/proxy.ts`), React 19, Prisma 7 + `@prisma/adapter-pg` (custom output `src/generated/prisma`), Supabase Auth (SSR), Tailwind v4 / shadcn, Serwist, Zustand, Zod.

## Quick Start

```bash
npm install
cp .env.example .env   # fill Supabase + DATABASE_URL/DIRECT_URL + SEED_USER_ID
npx prisma generate
npx prisma migrate dev
npm run dev            # http://localhost:3000
```

Landing (`/`) redirects authed users to `/dashboard`; unauthenticated to `/auth`.

## Environment

| Var | Used by | Note |
|---|---|---|
| `DATABASE_URL` | `src/lib/prisma.ts` (app) | Supabase pooler 6543 `?pgbouncer=true` |
| `DIRECT_URL` | `prisma.config.ts`, `prisma/seed.ts` | Supabase direct 5432 (migrations/seed) — seed falls back to `DATABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `src/lib/supabase/*` | Supabase project |
| `NEXT_PUBLIC_APP_URL` (preferred) or `NEXT_PUBLIC_SITE_URL` (legacy) | `src/actions/auth.ts` email links | `getAppUrl()` helper falls back to `http://localhost:3000` |
| `SEED_USER_ID` | `prisma/seed.ts` | Supabase `auth.users.id` to attach 10 system categories + 15 sample transactions (idempotent: re-run skips expenses if user already has data) |

See `.env.example` for template; `.env` is gitignored (`!.env.example` is tracked).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Next dev (Turbopack) |
| `npm run build` / `start` | Production build / serve (Serwist precaches 49 entries, `/offline` fallback) |
| `npm run lint` | `eslint .` |
| `npm test` | `tsx --test tests/**/*.test.ts` (28 tests: budget-status/period, CSV, validators) |
| `npm run db:generate` / `db:migrate` / `db:deploy` / `db:studio` / `db:format` / `db:reset` | Prisma wrappers |
| `tsx prisma/seed.ts` | Seed (requires `DIRECT_URL` + `SEED_USER_ID`) — `prisma.config.ts` also defines `seed` |

## Project Structure

```
src/
  app/
    page.tsx              # branded landing, authed → /dashboard
    offline/page.tsx      # PWA fallback for documents
    sw.ts / manifest.json # Serwist worker, FinSight manifest (#ffc400)
    (auth)/auth/page.tsx  # Tabs Sign In/Up (AuthShell — Google hidden in Phase 1)
    (user)/dashboard|expenses|budgets|categories|notifications|settings|admin
  actions/                # server actions (auth, expenses, budgets, categories, notifications, admin)
  components/
    expenses/   # ExpenseList (filtered + ExportCsvButton), dialogs
    budgets/    # BudgetList/Card/Actions (AlertDialog not window.confirm)
    categories/ # CategoryManager (AlertDialog, router.refresh, no reload)
    admin/      # system-category-manager, admin-users/expenses/notifications (AlertDialog)
    auth/       # auth-shell (Google hidden), signin/signup, forgot/reset
    notifications/ # notification-menu (w-[360px] h-[400px]), bell (deprecated)
    ui/         # shadcn radix-nova
  lib/
    budget/     # get-budget-period, get-budget-status, reconcile-budget-alerts
    ai/         # local-categorize (rules-v1)
    export/     # expenses-csv (BOM, summary, escape)
    validators/ # zod (auth/budget/expense)
    supabase/ + auth/ + prisma
  stores/       # Zustand notification-store
  proxy.ts      # Next 16 proxy (sessions, redirects /categories protected)
prisma/        # schema.prisma, migrations (init + add_budget_alert_resolution), seed.ts
tests/         # budget-status/period, expenses-csv, validators
```

## Database

```bash
npx prisma migrate dev   # creates/updates DB
npx prisma studio        # browser at http://localhost:5555
tsx prisma/seed.ts       # idempotent sample data (seed user must exist in Supabase auth.users)
```

Schema: `User` (Supabase UUID), `Category` (SYSTEM null userId vs CUSTOM), `Expense` (Decimal, categorizationSource), `AiCategorization`, `Budget` (periodStart/End, warningThreshold), `BudgetAlert`, `Notification`. See `prisma/schema.prisma`.

## Auth

Supabase SSR: `src/lib/supabase/server.ts` (RSC), `client.ts` (browser), `proxy.ts` (middleware). `src/lib/auth/get-current-user.ts` guards every `(user)` route; `src/lib/auth/sync-user.ts` upserts via `src/actions/auth.ts` signUp; `src/lib/auth/require-admin.ts` throws `ForbiddenError` → `src/app/(user)/admin/error.tsx` + `src/app/(user)/error.tsx` render 403.

Enable Supabase Realtime on `notifications` table for live bell; RLS must allow `userId = auth.uid()`.

## PWA

Serwist `src/app/sw.ts` precaches `__SW_MANIFEST`, runtime `defaultCache`, fallback `entries: [{url:"/offline"}]`. `next.config.ts` uses `withSerwist`. `src/app/manifest.json` branded FinSight, `theme_color #ffc400`.

## Testing & Quality

```bash
npx tsc --noEmit
npx eslint .
npm test               # 28 tests
npx next build
```

## Deploy

Vercel or any Node host — set all env vars in host (use `NEXT_PUBLIC_APP_URL` for production origin). Ensure Supabase auth redirect allowlist includes `/auth/callback` and `/password/reset`.
