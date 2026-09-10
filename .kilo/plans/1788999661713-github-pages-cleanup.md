# GitHub Pages / Repo Cleanup Plan

## Context (current state, verified)

Repo: `DenimPatel/black-scholes-sensitivity-analysis` (React + Vite + TypeScript).

- Two branches:
  - `main` — source code (`App.tsx`, `components/`, `services/`, `vite.config.ts`, `.github/workflows/deploy.yml`, etc.)
  - `gh-pages` @ `039edb1` (`deploy: f06e897...`) — committed build output (index.html + assets/), deployed site
- GitHub Pages is live at `https://denimpatel.github.io/black-scholes-sensitivity-analysis/` and matches `gh-pages` exactly (verified via fetch). Publishing currently works.
- Existing deploy: `.github/workflows/deploy.yml` (peaceiris/actions-gh-pages@v3, push-to-branch style), triggered on push to `main`.
- `vite.config.ts` sets `base: '/black-scholes-sensitivity-analysis/'` — correct for a user-site project subpath.
- `package.json` has duplicated deploy tooling: `gh-pages` devDependency + `predeploy`/`deploy` npm scripts + `homepage` field.
- Local checkout is on `gh-pages` (working tree = built site).

## Problems found

1. GitHub **default branch is `gh-pages`** (`origin/HEAD -> refs/heads/gh-pages`), not `main`. Wrong: source of truth should be `main`.
2. **Broken `/index.css`** `<link>` in `index.html` (both main and deployed). Resolves to domain root `https://denimpatel.github.io/index.css` → **404 (verified)**. No `index.css` exists in the repo. The app's actual styles come from the Vite-bundled CSS + Tailwind CDN.
3. **Broken `/vite.svg` favicon** — referenced in `index.html` but not committed → 404.
4. **Duplicate deploy mechanisms**: CI workflow (peaceiris) *and* npm `gh-pages` script + devDependency + `homepage`.
5. **Outdated Actions**: `checkout@v2`, `setup-node@v2`, `peaceiris/actions-gh-pages@v3`.
6. Local worktree on `gh-pages` makes local dev confusing.

## Decision

Standardize on the **official `actions/deploy-pages`** pipeline. Pages source will be switched to "GitHub Actions" (repo-settings change). The `gh-pages` branch and npm `gh-pages` tooling become obsolete and are removed after verification.

## Current blockers (as of re-check, 00:25 UTC)

- User report: Pages settings "changed to support GitHub Pages from Action". **Verified via API — half-true:** `build_type` is now `workflow` (source = GitHub Actions) ✔, but `source` still reports `{branch: gh-pages, path: /}` and `origin/HEAD` still points to `gh-pages`. So the **default-branch change is still missing** (task 4).
- Critical: the workflow on `main` is still the old peaceiris one. With `build_type: workflow`, that workflow will no longer produce a deploy (it only pushes to the now-ignored `gh-pages` branch). The **workflow rewrite (task 2) is the immediate unblock** — until it's committed and a push to `main` runs the new workflow, no new Pages deploy will happen. `status: built` refers to the last branch-based build; `html_url` still serves the old `gh-pages` artifact.

## Tasks

### 1. Fix `index.html` stray root-absolute references
- Remove `<link rel="stylesheet" href="/index.css">` (broken 404 link; app is styled via bundled CSS + Tailwind CDN).
- Add `public/vite.svg` (copy of the default Vite logo or any favicon) and change `href="/vite.svg"` to `href="%BASE_URL%vite.svg"` so Vite rebases it under `/black-scholes-sensitivity-analysis/`.

### 2. Replace deploy workflow with official GitHub Pages actions
Rewrite `.github/workflows/deploy.yml`:
- Trigger: `push` to `main` + `workflow_dispatch`.
- `permissions`: `contents: read`, `pages: write`, `id-token: write`.
- `concurrency`: group `pages`, `cancel-in-progress: true`.
- Job `build`: checkout@v4 → setup-node@v4 (node 20) → `npm ci` → `npm run build` → configure-pages@v5 → upload-pages-artifact@v3 (`path: ./dist`).
- Job `deploy` (needs build, environment `github-pages` with `page_url` output): deploy-pages@v4.

### 3. Clean up `package.json`
- Remove `gh-pages` from devDependencies.
- Remove `predeploy` and `deploy` scripts (keep `dev`, `build`, `preview`).
- Remove `homepage` field (unused; `base` lives in `vite.config.ts`).
- Run `npm install` to prune the lockfile.

### 4. (Manual, repo settings) Change default branch to `main`
- GitHub → Settings → Branches → Default branch → `main`. Do this **before** migrating Pages source so the deploy still points at the live site during transition.

### 5. (Manual, repo settings) Switch Pages source to GitHub Actions — ✅ DONE
- Confirmed via API: `build_type: workflow`. Source "GitHub Actions" is now active. No action needed.

### 6. Verify the new pipeline end-to-end
- Trigger a deploy (push a trivial commit to `main` or run `workflow_dispatch`).
- Confirm the workflow's `deploy` job runs with the `github-pages` environment and the live URL updates.
- Re-fetch the live site and confirm assets (index-*.js/css, fonts, favicon) load under `/black-scholes-sensitivity-analysis/` with no 404s.

### 7. Remove the obsolete `gh-pages` branch (after successful verification)
- Delete remote branch `gh-pages` (only after step 6 succeeds, since Pages no longer serves from it).
- Locally: `git checkout main`, `git branch -d gh-pages` (or `-D` if still checked out), `git fetch --prune`.
- `origin/HEAD` will now point to `main`.
- Optional: also remove `.nojekyll` from any future deploy artifact needs (not needed with GitHub Actions deploys; it will be dropped automatically by the new pipeline since it was only committed on the gh-pages branch).

### 8. Optional app-level note (out of scope for repo cleanup)
- Production copies of Tailwind should use the compiled build rather than the `cdn.tailwindcss.com` runtime script, and `GEMINI_API_KEY` is baked in via `vite.config.ts` `define` from env — verify it is never committed. Not required for the Pages cleanup.

## Validation

- `npm run build` succeeds locally and produces a `dist/` with rebased asset URLs (`/black-scholes-sensitivity-analysis/...`).
- Deployed HTML contains no `/index.css` link and favicon resolves (200).
- Live site renders (fetch `https://denimpatel.github.io/black-scholes-sensitivity-analysis/` and check referenced assets return 200).
- Workflow run on `main` is green and the deploy job reports the URL.
- `git ls-remote --symref origin HEAD` shows `ref: refs/heads/main`.

## Risks / notes

- Steps 4 and 5 are manual GitHub settings changes; no CLI command can complete them.
- If the site breaks at any point during migration, the fallback is: revert Pages source to "Deploy from a branch → gh-pages". Do not delete `gh-pages` until deploy-pages is confirmed working.
- `npm ci` requires `package-lock.json` to be committed — it already is.