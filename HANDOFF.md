# NightDrive: Project Notes & Handoff

Last updated: 2026-09-30 (skeleton done)

## 1. What this project is

NightDrive is a mobile-friendly **website** (not a native app) for discovering and planning scenic
night drives: routes, viewpoints, cafés, fuel stations and other stops. It is for planning before a
trip; there is no live navigation or GPS tracking in v1.

**Primary goal: learning CI/CD.** The app is the vehicle. The main deliverable is a real pipeline
with **Staging** and **Production** environments, required checks, and gated promotion.

### MVP features
1. Browse scenic driving routes
2. View routes on a map
3. Route details page
4. Search routes
5. Filter by location/region, scenery, road quality, difficulty
6. Create an account (register/login)
7. Submit a new route for review
8. Admin approves / rejects (also edits / removes) submitted routes

### Later features (not in v1)
Reviews, user ratings, photo uploads, favorites, user profiles, recommendations, nearby places
(fuel/cafés/viewpoints/parking), collections, better map navigation, real-time driving features.

### Pages
```text
Home: featured routes, search, filters, explore routes (list + map)
Route details: map, route info, photos (placeholder in v1), ratings, reviews (placeholder), nearby places/stops
Login / Register
Submit a route
User profile: my submissions + their status
Admin dashboard: approve, reject, edit, remove routes
```

Example route shape:
Tbilisi → Kojori · 42 km · ~1 h · Scenery 9/10 · Road quality 7/10 ·
Best for: coupes, mountain views, quiet drives · Notes: best at sunset or at night.

---

## 2. Decisions made

| Area | Decision |
|---|---|
| CI/CD | **GitHub Actions**. All pipeline logic lives in workflow YAML in the repo |
| Hosting | **Vercel**, deployed *from GitHub Actions via the Vercel CLI* (Vercel's own Git auto-deploy disabled) |
| Branching | **`develop` → Staging**, **`main` → Production** |
| Database | **Neon Postgres**: separate branch/database per environment |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 |
| ORM / migrations | Drizzle ORM + drizzle-kit (SQL migrations committed to repo) |
| Local DB | **PGlite** (embedded Postgres, no Docker needed) when `DATABASE_URL` is unset |
| CI DB | Real Postgres 16 **service container** in GitHub Actions |
| Maps | Leaflet + react-leaflet, OpenStreetMap / CARTO dark tiles (no API key) |
| Auth | Own implementation: email + password (Node `crypto.scrypt`), session token in httpOnly cookie, `sessions` table |
| Validation | zod |
| Unit tests | Vitest |
| E2E / smoke tests | Playwright |

### Environment layout

| Environment | Git trigger | Vercel target | Database | URL |
|---|---|---|---|---|
| Local | n/a | `next dev` | PGlite (`.pglite/`) | localhost:3000 |
| CI | every PR | none | Postgres service container | n/a |
| Preview (optional) | PR | Vercel preview | Neon `preview` branch | per-PR URL |
| **Staging** | push to `develop` | Vercel *preview* deployment, aliased | Neon `staging` branch | e.g. `nightdrive-staging.vercel.app` |
| **Production** | push to `main` + manual approval | Vercel production | Neon `main` branch | e.g. `nightdrive.vercel.app` |

Vercel "Custom Environments" (a real "staging" env) require a paid plan. On the free tier, staging
is a **preview deployment built from `develop`** that uses **branch-scoped Preview env vars**
(`--git-branch=develop`) and is then given a fixed alias with `vercel alias set`.

---

## 3. Pipeline design

### `ci.yml`: runs on every PR (to `develop` and `main`) and on pushes
Jobs (all must pass; mark them as required status checks):
1. **lint**: `npm run lint`
2. **typecheck**: `npm run typecheck`
3. **unit tests**: `npm test` (Vitest)
4. **migrations check**: `drizzle-kit check` + verify no un-generated schema changes
   (run `drizzle-kit generate` and fail if `git diff` shows new files)
5. **build**: `npm run build`
6. **e2e**: start Postgres service container → `db:migrate` → `db:seed` → build → start → Playwright
Use `actions/setup-node` with npm cache and `concurrency` to cancel superseded runs.

### `deploy-staging.yml`: on push to `develop`
GitHub Environment: **`staging`** (secrets scoped to it)
1. Re-run checks (or `needs:` the CI workflow)
2. `npm run db:migrate` against `STAGING_DATABASE_URL`
3. `vercel pull --yes --environment=preview --git-branch=develop --token=$VERCEL_TOKEN`
4. `vercel build --token=...`
5. `vercel deploy --prebuilt --token=...` → capture URL
6. `vercel alias set <url> nightdrive-staging.vercel.app --token=...`
7. **Smoke tests** (Playwright `@smoke` tag) against the staging URL

### `deploy-production.yml`: on push to `main`
GitHub Environment: **`production`** with **required reviewer** (manual approval gate)
1. Checks
2. **Wait for approval** (environment protection rule)
3. `npm run db:migrate` against production DB
4. `vercel pull --yes --environment=production` → `vercel build --prod` → `vercel deploy --prebuilt --prod`
5. Smoke tests against production URL
6. On failure: document rollback (`vercel rollback` / `vercel promote <previous-url>`)

### Repo protections to configure in GitHub
- Branch protection on `main` and `develop`: require PR, require status checks (CI jobs), no force
  push, no direct pushes
- `main` only accepts PRs from `develop` (release PRs); hotfixes via `hotfix/*` → `main` → back-merge
- Environments: `staging` (no approval), `production` (required reviewer = repo owner, deploy only
  from `main`)

### Secrets / variables
| Name | Where | Purpose |
|---|---|---|
| `VERCEL_TOKEN` | repo secret | Vercel CLI auth |
| `VERCEL_ORG_ID` | repo secret/var | from `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | repo secret/var | same |
| `DATABASE_URL` | env secret in `staging` and `production` (different values) | migrations from CI |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | `staging` env secret | lets smoke tests pass Vercel preview protection (header `x-vercel-protection-bypass`) |
| `SESSION_SECRET` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Vercel env vars per environment | app runtime |

Vercel side: set `DATABASE_URL` for **Production** (Neon main) and for **Preview scoped to branch
`develop`** (Neon staging). Disable Git auto-deploys with `vercel.json`:
`{ "git": { "deploymentEnabled": false } }`.

---

## 4. App design (planned)

### Data model (Drizzle / Postgres)
- **users**: id, email (unique), name, password_hash, role (`user` | `admin`), created_at
- **sessions**: id (random token hash), user_id, expires_at
- **routes**: id, slug (unique), title, start_name, end_name, region, distance_km, duration_min,
  scenery (1–10), road_quality (1–10), difficulty (`easy` | `moderate` | `challenging`),
  best_for (text[]), best_time, description, notes, path (jsonb: `[lat,lng][]`),
  stops (jsonb: `{name,type: fuel|cafe|viewpoint|parking, lat, lng, note}[]`), featured (bool),
  status (`pending` | `approved` | `rejected`), reject_reason, submitted_by → users, created_at, updated_at

Only `approved` routes are public. Submissions start as `pending`.

### Seed routes (Georgia), with approximate coordinates
1. Tbilisi → Kojori: 42 km, 60 min, scenery 9, road 7, moderate (Tbilisi 41.694,44.801 → Tskneti ~41.694,44.700 → Kojori ~41.664,44.708)
2. Georgian Military Road, Tbilisi → Stepantsminda: ~155 km, 180 min, scenery 10, road 7, challenging (Ananuri 42.164,44.703 → Gudauri 42.478,44.479 → Kazbegi 42.657,44.643)
3. Gombori Pass, Tbilisi → Telavi → Sighnaghi: scenery 9, road 6, moderate (Telavi 41.920,45.473; Sighnaghi 41.620,45.922)
4. Batumi → Sarpi coastal: 18 km, scenery 8, road 8, easy (Batumi 41.617,41.637 → Sarpi 41.521,41.548)
5. Borjomi → Bakuriani: 30 km, scenery 8, road 7, moderate (Borjomi 41.839,43.379 → Bakuriani 41.750,43.530)
6. Tbilisi night loop (Turtle Lake / Tbilisi Sea): 25 km, scenery 7, road 8, easy (Turtle Lake 41.693,44.761; Tbilisi Sea 41.755,44.820)
7. Kutaisi → Martvili: 55 km, scenery 7, road 6, easy (Kutaisi 42.268,42.695 → Martvili 42.414,42.379)
8. Zugdidi → Mestia: 135 km, scenery 10, road 6, challenging (Zugdidi 42.509,41.871 → Jvari 42.717,42.050 → Mestia 43.045,42.729)
9. Tbilisi → Mtskheta / Jvari Monastery: 25 km, scenery 8, road 8, easy (Mtskheta 41.845,44.720; Jvari 41.838,44.734)

Route paths are hand-placed waypoints (not road-snapped) in v1.

### UI
Dark "night" theme with a warm neon accent. Route cards show the route's shape as a glowing SVG line
(projected from `path`). Submit form: click on the map to add waypoints. Admin dashboard: pending
queue with approve/reject (with reason), plus edit and delete for any route. A seeded admin account
comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars.

### Planned file layout
```text
app/                 routes: /, /routes/[slug], /login, /register, /submit, /profile, /admin
components/          RouteCard, RouteMap (client, dynamic ssr:false), Filters, ...
lib/db/schema.ts     Drizzle schema
lib/db/index.ts      client: postgres-js if DATABASE_URL set, else PGlite (.pglite/)
lib/auth.ts          scrypt hashing, sessions, getCurrentUser, requireAdmin
lib/routes.ts        queries + filter logic (unit-tested)
drizzle/             generated SQL migrations (committed)
scripts/migrate.ts   runs migrations (both drivers)
scripts/seed.ts      idempotent seed (routes + admin)
tests/unit/          Vitest
tests/e2e/           Playwright (tag smoke tests with @smoke)
.github/workflows/   ci.yml, deploy-staging.yml, deploy-production.yml
vercel.json          disable Git auto-deploy
```

---

## 5. Current state (where things stopped)

- GitHub repo: **https://github.com/unseenmeli/NightDrive**; `main` and `develop` pushed
- Branch **`feat/app-foundation`** holds the working **skeleton** (plain HTML, no styling yet):
  - Browse, search and filter routes; route details page (no map yet)
  - Register / login / logout (scrypt + DB sessions); admin seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD`
  - Submit a route (waypoints typed as `lat, lng` lines for now), profile with submission status
  - Admin dashboard: approve, reject with reason, edit, delete
  - Drizzle schema + first migration in `drizzle/`, idempotent seed with the 9 routes
  - Vitest unit tests (`tests/unit`) and Playwright e2e (`tests/e2e`, read-only ones tagged `@smoke`)
  - `.github/workflows/ci.yml`: lint, typecheck, unit, migrations check, build, e2e (Postgres 16 service)
- Local commands: `cp .env.example .env && npm run db:setup && npm run dev`; `npm test`; `npm run test:e2e`
  (e2e uses its own PGlite dir `.pglite-e2e/`); `BASE_URL=<url> npm run test:smoke` for a deployed site
- `npm run typecheck` runs `next typegen` first (route types like `PageProps` are generated).
- `next dev` writes `AGENTS.md`/`CLAUDE.md` into the repo root; they are gitignored.
- The e2e flow against real Postgres has only been verified in CI, not locally (no Docker).
- No Vercel project, Neon project, or GitHub Environments/secrets set up yet.

## 6. Next steps (in order)

1. ~~Skeleton: config, schema → migrations → seed → pages → auth → submit → admin~~ (done)
2. ~~Unit tests + Playwright e2e/`@smoke` tests + `ci.yml`~~ (done)
3. Open PR `feat/app-foundation` → `develop`; get CI green
4. Polish in small PRs: Leaflet maps (list, details, click-to-add waypoints on submit), route
   shape SVG on cards, dark "night" theme with Tailwind, stops editor, featured toggle in admin
5. Create Neon project with branches `main` (prod) and `staging`
6. `vercel link`, add Vercel env vars (Production + Preview scoped to `develop`),
   add `vercel.json`, enable Protection Bypass for Automation
7. Create GitHub Environments `staging` and `production` (required reviewer on production), add secrets
8. Add `deploy-staging.yml` and `deploy-production.yml`
9. Turn on branch protection + required status checks for `develop` and `main`
10. First release: PR `develop` → `main`, approve deploy, verify smoke tests, practice a rollback

## 7. Gotchas / notes

- The folder name `NightDrive` has capital letters, so `create-next-app .` refuses it (npm naming).
  The package name is `nightdrive`.
- `gh` CLI and Docker are **not installed** locally. Install `gh` (`brew install gh`) to manage
  PRs, environments and branch protection from the terminal.
- Vercel CLI locally is 53.3.1. Update with `npm i -g vercel@latest`.
- `npm audit` shows 4 moderate advisories coming from `drizzle-kit`'s dev-only esbuild dependency
  (not in the runtime bundle). Decide whether CI fails on `npm audit --omit=dev --audit-level=high`.
- TypeScript is pinned to ~5.9 (TS 7 is out, but Next's type-check integration relies on the TS 5 API).
- ESLint pinned to v9 to match `eslint-config-next`. Next 16 has no `next lint`; use `eslint .`.
- Next 16: `params` / `searchParams` / `cookies()` are async; `middleware.ts` is now `proxy.ts`.
- Vercel preview deployments are protected by default. Smoke tests against staging need the
  automation bypass header.
- Commit messages: plain, descriptive, no `Co-Authored-By` trailers.
