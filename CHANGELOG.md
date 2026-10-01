# Changelog

## Unreleased — 2026-10-01 (audit fixes)

### Added

- **Settings** page (`/settings`, linked in the header): change your name, change your password (signs out other devices), and delete your account with password confirmation — recipes and log go with it. The shared demo account can't be renamed, re-passworded or deleted (403).
- **Undo** when removing a food log entry: the row fades for five seconds before it's deleted; failures now show Retry.
- Confirmation message after adding a manual food log entry.

### Fixed

- Recipe card titles are `h2` under the page `h1` (were `h3`, skipping a level).
- Ingredient-row validation messages are linked to their inputs (`aria-describedby`), so screen readers read them.
- Names are validated (1–100 characters, trimmed) on sign-up and update, not only in the browser.

## 2026-09-28

### Added

- Landing page at `/` for signed-out visitors (signed-in users still go straight to `/dashboard`), with real screenshots, link-preview image and a one-click **Try the demo** (`POST /api/demo`, same-origin only; enabled by `DEMO_EMAIL`/`DEMO_PASSWORD`).

### Fixed

- Registering with an email that already has an account now says so and links to sign in, instead of a vague error.

### Changed (pre-deploy cleanup)

- Upgraded `better-auth` 1.7.0 → 1.7.6, `zod` 4.6, Tailwind 4.3; dropped `Account.issuer`, which better-auth 1.7.6 removed (keeping it would have broken sign-up).
- All database access now goes through `src/lib` (new `profile.js`); the food log's day totals use the same SQL aggregate as the dashboard.
- CI uses `actions/checkout@v5` / `actions/setup-node@v5`.
- `npm run seed:demo -- --reset` rebuilds the demo account so "today" always has data.
- New tests for `/api/me`, `/api/demo` (login-CSRF guard) and `proxy.js` — 54 total.

### Removed

- Unused `useSession` / `authClient` exports.

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
