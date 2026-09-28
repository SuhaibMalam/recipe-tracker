# Changelog

## Unreleased — 2026-09-28

### Added

- Landing page at `/` for signed-out visitors (signed-in users still go straight to `/dashboard`), with real screenshots, link-preview image and a one-click **Try the demo** (`POST /api/demo`, same-origin only; enabled by `DEMO_EMAIL`/`DEMO_PASSWORD`).

### Fixed

- Registering with an email that already has an account now says so and links to sign in, instead of a vague error.

## 2026-09-24

### Added

- Recipe CRUD: REST API (`/api/recipes`, `/api/recipes/:id`), shared create/edit form, detail page, list with search (title or ingredient) and pagination.
- Food log: log a recipe by servings or a manual entry by day; history grouped by day with totals (`/api/logs`, `/log`).
- Overview dashboard: today's calories and macros, optional daily calorie goal (`/api/me`), 7-day calorie chart with keyboard-accessible tooltips and a table view, most-logged recipes.
- "Warm Kitchen" design system: Tailwind v4 theme tokens, Fraunces + Inter, shared `Button`/`Field`/`Alert`/`EmptyState` components, split-screen auth pages, custom icon.
- `proxy.js` route protection, `requireUser()` session helper, `?next=` return path with open-redirect protection.
- Database-backed rate limiting on sign-in/sign-up; baseline security headers.
- Vitest unit and integration suites (44 tests), GitHub Actions CI, Prettier, `.env.example`.

### Changed

- `NutritionLog` now stores a snapshot (`name`, `servings`) and a local calendar `day`; `recipeId` is optional with `onDelete: SetNull`.
- `Recipe` gains `servings` and `updatedAt`; nutrition is per serving.
- Sign-up goes straight to the dashboard (auto sign-in was already on).
- Upgraded Next.js 16.2.2 → 16.3.6 (security advisories); pinned `better-auth` to `~1.7.0`.

### Fixed

- App failed to build: `layout.js` imported a deleted `SessionWrapper`.
- Sign-up returned 500 after better-auth 1.7 introduced `Account.issuer`; added the column with a backfill migration.
- Missing indexes on `Session.userId`, `Account.userId`, `Verification.identifier`.

### Removed

- Unused `bcryptjs` dependency and stale `NEXTAUTH_*` environment variables.
