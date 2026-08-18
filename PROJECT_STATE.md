# PROJECT_STATE.md

## Current Focus

**Blocking issue found this session — see Next Task #1 before doing anything else.** The working tree has an uncommitted `package.json`/`package-lock.json` change that downgrades `next` from `16.2.2` to `^9.3.3`, `better-auth` from `1.6.14` to `^1.4.3`, `eslint` from `^9` to `^4.0.0`, and `eslint-config-next` from `16.2.2` to `^0.2.4`, alongside adding `zod ^4.4.3`. This isn't just a declared range — `node_modules` actually has `next@9.3.3`, `better-auth@1.4.3`, and `eslint@4.0.0` installed. Next.js 9 predates the App Router (added in Next 13) entirely, so it's incompatible with the existing `src/app/*` structure this whole project is built on. Likely cause: a bad dependency resolution during `npm install zod` (registry/cache issue), not an intentional change. **Do not build on top of this until it's fixed.**

Recipe ingredients are normalized (`Ingredient` / `RecipeIngredient` join model, migrated) and the authenticated dashboard shell exists with a real nav bar and empty state. Work on wiring recipe create/edit forms to that model has started but is far from done: only the shared `zod` validation schema exists so far (`src/lib/validations/recipie.js` — note this is a different path than `recipe-ingredient-plan.txt` specifies, `src/lib/validation/recipe.js`; folder is plural "validations" and file uses the repo's own "recipie" spelling). No API routes, `RecipeForm` component, `/recipes/*` pages, or dashboard list exist yet.

The register page bugs flagged on 2026-07-07/2026-07-14 are fixed and committed (`3a9014a`): only one `router.push("/login?registered=1")` fires, and errors are shown via an allowlist (`SAFE_ERROR_CODES`) so only known-safe Better Auth error messages reach the user instead of raw backend errors.

The root route (`/`) is now session-aware: it redirects to `/dashboard` if logged in, `/login` otherwise, instead of rendering a static marketing page. Login, register, and dashboard got a shared visual pass (gradient auth backgrounds, brand link back to `/`, dashboard top nav + "No recipes yet" empty-state card). Committed as `2cdc804`.

---

## Next Task

1. **Fix the dependency regression first.** Restore `next`, `better-auth`, `eslint`, and `eslint-config-next` in `package.json` to their prior ranges (keep `zod`), delete `node_modules` and `package-lock.json`, run a clean `npm install`, and confirm `npm run dev` boots and the existing login/register/dashboard flow still works before writing any more code.
2. Resume `recipe-ingredient-plan.txt` (repo root) from step 2 — API routes (`/api/recipes`, `/api/recipes/[id]`), the shared `RecipeForm` component, `/recipes/new` and `/recipes/[id]/edit` pages, and the dashboard recipe list. The plan's full design (API contract, transaction shape, file list, verification steps) is unchanged and still applies; just reconcile the validation file's actual path (`src/lib/validations/recipie.js`) against what the plan document says.

---

# Development History

## 2026-08-18 (later session)

### Summary

Doc-only session again: re-read `CLAUDE.md` and `PROJECT_STATE.md`, then re-verified the prior session's findings against the actual working tree instead of trusting the doc — checked `git status`, `git log`, `package.json`'s diff against HEAD, and installed versions directly under `node_modules/*/package.json`. Everything in the doc still holds: `next@9.3.3`, `better-auth@1.4.3`, `eslint@4.0.0` are genuinely installed (not just declared), `src/lib/validations/recipie.js` and `recipe-ingredient-plan.txt` exist as described, and no `/api/recipes` or `/recipes/*` routes exist yet — `src/app/api` still only contains the Better Auth catch-all. No code changes made.

### Next Task

See "Next Task" above.

---

## 2026-08-18 (earlier session)

### Summary

Doc-only session: read `CLAUDE.md` and `PROJECT_STATE.md`, then audited the working tree against the 2026-07-28 plan. Found real progress (`src/lib/validations/recipie.js`, matching the plan's shared zod schema) but also found the dependency regression described above — confirmed by checking installed versions in `node_modules` directly, not just `package.json`'s declared ranges. No code changes made; this is a warning for the next coding session.

### Next Task

See "Next Task" above.

---

## 2026-07-28 (later session)

### Summary

Planned the recipe create/edit form + `RecipeIngredient` wiring milestone (no code changes yet — user is implementing it directly). Confirmed via exploration that this is fully greenfield: no recipe API routes, forms, or list/detail pages exist anywhere in `src/`. Corrected a stale claim in this file about `NutritionLog.recipeId` needing a migration — it's already migrated. Wrote the full design (API contract, Prisma transaction shape for nested `RecipeIngredient` writes, zod schema, shared `RecipeForm` component, dashboard list) to `recipe-ingredient-plan.txt`.

### Next Task

See "Next Task" above.

---

## 2026-07-28

### Summary

Made the root route (`/`) session-aware — it now redirects to `/dashboard` or `/login` via `auth.api.getSession` instead of rendering a static landing page. Gave the dashboard a real shell (top nav with brand + `SignOutButton`, "No recipes yet" empty-state card) and matched login/register with a shared gradient background and brand link back to `/`.

### Code Changes

- `src/app/page.js`: replaced static landing page with a server-side session check + `redirect()`.
- `src/app/dashboard/page.js`: added nav bar and empty-state card in place of the bare heading.
- `src/app/login/page.js`, `src/app/register/page.js`: added gradient background, brand link, upgraded card shadow/border — no logic changes.

### Next Task

See "Next Task" above.

---

## 2026-07-14 (later session)

### Summary

Fixed a broken local dev environment: `node_modules` (extracted from a zip archive) had corrupted/blocked native binaries, causing `next dev` to OOM-crash on startup. Reinstalled clean (`rm -rf node_modules .next && npm install`); `next dev` now starts normally. Committed and pushed all pending working-tree changes from the earlier 2026-07-14 session (`3a9014a`): normalized `Ingredient`/`RecipeIngredient` schema + migration, dashboard page, `SignOutButton`, and the login/register UX/error-handling fixes. `.claude/` and the duplicate `Claude.md` were deliberately left untracked (local tooling config, not project code).

### Bugs Fixed

- Register page's duplicate `router.push` (flagged 2026-07-07, worsened 2026-07-14 earlier) — confirmed already resolved in the committed code, only `router.push("/login?registered=1")` remains.
- Register page error handling — confirmed already resolved: errors are filtered through a `SAFE_ERROR_CODES` allowlist rather than swallowed into one generic string.

### Next Task

See "Next Task" above.

---

## 2026-07-14 (earlier session)

### Summary

Reviewed uncommitted working-tree changes (nothing new committed at the time). Prettier-style formatting pass on `schema.prisma`, plus a new `NutritionLog.recipeId` relation to `Recipe` that has not been migrated yet. `auth.js`/login/register/dashboard/SignOutButton from 2026-07-07 were still uncommitted at the time (now committed, see session above).

### Next Task

See "Next Task" above.

---

## 2026-07-09

### Summary

Fixed the `RecipeIngredient` schema syntax errors and ran the Prisma migration
(`20260709082135_fix_recipe_ingredient_syntax`), completing the schema side of the
ingredient normalization started on 2026-07-07.

### Code & Database Changes

- `prisma/schema.prisma`: fixed `displayOrder` field name and the composite unique
  constraint (`@@unique([recipeId, ingredientId])`).
- Ran `prisma migrate dev` — dropped `Recipe.ingredients` (string), created
  `Ingredient` and `RecipeIngredient` tables. No backfill of old data (dev database,
  no real user data to preserve).

### Next Task

Wire up recipe create/edit forms to the new `RecipeIngredient` relation.

Full write-up: `docs/09-Daily-Notes/2026-07-09.md` and
`docs/07-Decisions/ADR/ADR-001-Normalized-Ingredient-Model.md`.

---

## 2026-07-07

### Summary

Auth flow polish (post-registration UX, auto sign-in) and first pass at normalizing recipe ingredients in the schema. Added a minimal authenticated dashboard page with sign-out.

### Features Completed

- Dashboard route (`src/app/dashboard/page.js`) — server-rendered, redirects to `/login` if no session, greets user by name/email.
- `SignOutButton` client component — calls `signOut()` then redirects to `/login`.
- Login page shows a "Account created — sign in below" success message after registration via `?registered=1` query param (wrapped in `Suspense` since it uses `useSearchParams`).

### Code & Database Changes

- `prisma/schema.prisma`: replaced `Recipe.ingredients` (String) with a `recipeIngredients RecipeIngredient[]` relation; added new `Ingredient` and `RecipeIngredient` models. **Not yet migrated** — schema currently has syntax errors (see Next Task).
- `src/lib/auth.js`: enabled `autoSignIn: true` on Better Auth's `emailAndPassword` config.

### Architecture Decisions

- Moving from a free-text `ingredients` string to a normalized `Ingredient` + `RecipeIngredient` join table so ingredients can be shared/queried across recipes (e.g. for nutrition aggregation later) instead of being trapped in unstructured text per recipe.

### Bugs Fixed

- None (register page currently has two consecutive `router.push` calls to `/login` — the redirect-with-`registered=1` was added but the original unconditional push above it wasn't removed; low-impact but should be cleaned up next session).

### Next Task

Fix schema syntax errors in `RecipeIngredient`/`Ingredient` models, run `prisma migrate dev`, then wire up recipe create/edit forms to the new ingredient relation.
