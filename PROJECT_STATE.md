# PROJECT_STATE.md

Current state of the codebase for whoever picks it up next. The README covers architecture and design decisions; this file tracks status and what's next.

_Last updated: 2026-09-24_

## Stack (verified from package.json / node_modules)

- Next.js 16.3.6 (App Router, Turbopack), React 19.2.4, plain JavaScript, Tailwind CSS 4
- Prisma 6.19.3 + PostgreSQL (Neon, `us-east-1`)
- Better Auth 1.7.6 (pinned `~1.7.x`). Its database schema has changed even in patch releases (1.7.0 added `Account.issuer`, 1.7.6 removed it). After any upgrade, run `npm run test:integration`: `demo-api.test.js` does a real sign-up and fails on schema drift.
- Zod 4, Vitest 3, Prettier 3, Node ≥ 22

## Status

| Phase                                           | State                                         |
| ----------------------------------------------- | --------------------------------------------- |
| 0 — Fix broken build, migration drift, deps     | Done                                          |
| 0.5 — "Warm Kitchen" design system              | Done                                          |
| 1 — Recipe CRUD                                 | Done                                          |
| 2 — Nutrition logging                           | Done                                          |
| 3 — Dashboard analytics                         | Done                                          |
| 4 — Polish (search, pagination, a11y, security) | Done, except image upload (needs S3)          |
| 5 — Tests                                       | Done — 27 unit + 17 integration               |
| 6 — CI + docs                                   | Done — CI not yet run on GitHub (push needed) |
| 7 — AWS deployment                              | **Next.** User-driven; Claude guides.         |

## Verified by hand (2026-09-24)

- Register → dashboard, sign in with `?next=` return, sign out, wrong password message.
- Recipe create / edit (remove ingredient, change servings) / delete confirm; validation messages and focus-on-first-error.
- Log a recipe (1.5 servings → scaled macros), manual entry on a past day, remove entry, day totals.
- Dashboard goal set/validation, chart tooltip, table view; mobile layout at 390px.
- Production build: security headers present, 6th sign-in in a minute → 429 with a friendly message, Lighthouse 100/100/100 (a11y / best practices / SEO) on both the login page and the dashboard.

## Things to know

- **Restart `npm run dev` after any Prisma migration.** The dev server keeps the old generated client in memory and fails with "Unknown argument".
- `TEST_DATABASE_URL` points at the same Neon database with `?schema=test`. The integration setup truncates that schema only and refuses to run if it equals `DATABASE_URL`.
- The remote database adds ~250 ms per round trip from India, which is why integration tests have a 30s timeout. Deploy the app in the same region as the database.
- Migration `20260924110000_better_auth_1_7_account_issuer` was hand-written (backfills `issuer = 'local:' || providerId`) because Prisma can't add a required column to a non-empty table.
- All accounts were cleared from the dev database on 2026-09-24. `npm run seed:demo` (with the app running) recreates a demo account (`demo@recipetracker.app` / `try-the-demo-2026`) with 6 recipes and 2 weeks of log, through the real API; override with `SEED_BASE_URL`, `DEMO_EMAIL`, `DEMO_PASSWORD`. Use a different password on the deployed instance.

## Landing page + demo (2026-09-28)

- `/` is a landing page for visitors; "Try the demo" signs into the shared demo account via `POST /api/demo`.
- `npm run seed:demo -- --reset` wipes and reseeds the demo through the API (visitors can edit it, and its logs are dated relative to the run, so "today" goes stale). **Still to do:** schedule it nightly once deployed.

## Tech debt Phase A — done (2026-09-28, PR `chore/pre-deploy-cleanup`)

Dependency patches, CI actions v5, data access only via `src/lib`, dead exports removed, demo reset, tests for `/api/me`, `/api/demo`, `proxy.js`. Remaining audit items are sequenced with deployment (monitoring, nightly demo reset) and after launch (password reset/email verification, CSP, table cleanup).

## Next: Phase 7 — AWS (user drives, Claude guides)

Decide together, then do step by step:

1. Hosting: Amplify Hosting (managed, closest to Vercel) vs. ECS Fargate + container (more to learn and talk about). Region must match the database.
2. Database: keep Neon, or move to RDS Postgres in the same region/VPC.
3. S3 bucket + presigned uploads for recipe images (finishes Phase 4).
4. Secrets in SSM Parameter Store / Secrets Manager, `BETTER_AUTH_URL` set to the real domain, `prisma migrate deploy` as a release step.
5. Then: CSP with nonces, custom domain + HTTPS, add the live URL to the README.
