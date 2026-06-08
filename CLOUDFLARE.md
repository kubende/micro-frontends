# Deploying to Cloudflare Pages

Step-by-step guide to deploy this workspace to Cloudflare Pages. You will
create **three Pages projects** (one per app) backed by the same Git
repository, distinguished only by their build command and output directory.

---

## What's already in the repo for you

The following files and code changes are already in place — you don't have
to write any of this:

- `apps/shell/src/entitlements.ts` reads remote URLs from `PUBLIC_*` env
  vars (Rsbuild inlines `PUBLIC_*` at build time), falls back to localhost
  for dev, and honours a `?remote_<name>=<url>` query param for preview
  testing.
- `apps/product-config/rsbuild.config.ts` and
  `apps/underwriting/rsbuild.config.ts` set `output.assetPrefix` from
  `PUBLIC_ASSET_PREFIX`, with `CF_PAGES_URL` as a per-preview fallback
  (Cloudflare sets this automatically on every deploy).
- `cloudflare/_headers` per app: CORS + cache headers for the remotes,
  long-cache for hashed chunks.
- Rsbuild `output.copy` is configured to copy `cloudflare/_headers` into
  the build output, where Cloudflare reads it.
- `wrangler.jsonc` per app, declaring `assets.directory: "./dist"`
  (Cloudflare's unified Workers+Assets format — `pages_build_output_dir`
  was deprecated in wrangler 4.x). Required in monorepos because without
  per-project config wrangler sees the workspace `pnpm-workspace.yaml`
  and refuses to deploy — it can't tell which project you mean.
- The shell's `wrangler.jsonc` also sets
  `assets.not_found_handling: "single-page-application"` so deep links
  serve `index.html` and React Router handles them. (Don't add a
  `_redirects` file — it will conflict with this setting and the deploy
  validator rejects the combination.)

All you need to do is the Cloudflare dashboard work below.

---

## Step 0 — Prerequisites

1. A Cloudflare account with permission to create Pages projects.
2. The repo pushed to GitHub or GitLab. Cloudflare Pages needs Git access
   for automatic per-branch previews.
3. The three production domains you intend to use. Worked example:

   | Project | Production domain |
   |---|---|
   | Shell | `app.example.com` |
   | product-config | `product-config.mfe.example.com` |
   | underwriting | `underwriting.mfe.example.com` |

   Each remote on its own subdomain keeps CORS, caching, and rollback
   isolated.

4. DNS access for `example.com`. If your DNS is already on Cloudflare,
   record management is in the same dashboard.

---

## Step 1 — Create the shell Pages project

1. **Cloudflare Dashboard → Workers & Pages → Create application → Pages →
   Connect to Git.**
2. Select your repo and the branch you want as production (typically
   `main`).
3. **Project name:** `insurer-shell` (lower-case, this becomes the
   `*.pages.dev` subdomain).
4. **Build settings:**
   - Framework preset: **None**.
   - **Root directory (advanced):** `apps/shell` ← important. This scopes
     wrangler's view to the shell app only, so it doesn't get confused by
     the workspace `pnpm-workspace.yaml`. pnpm still resolves workspace
     packages by searching upward.
   - Build command: `pnpm install --frozen-lockfile && pnpm --filter shell build`
   - Build output directory: `dist` (relative to root directory, so the
     real path is `apps/shell/dist`)
5. **Environment variables (Build & deploy → Variables and Secrets):**

   | Name | Value | Type |
   |---|---|---|
   | `NODE_VERSION` | `20` | Plaintext |
   | `PNPM_VERSION` | `9.12.0` | Plaintext |
   | `PUBLIC_REMOTE_PRODUCT_CONFIG` | `https://product-config.mfe.example.com/mf-manifest.json` | Plaintext, production scope |
   | `PUBLIC_REMOTE_UNDERWRITING` | `https://underwriting.mfe.example.com/mf-manifest.json` | Plaintext, production scope |

   Set the `PUBLIC_REMOTE_*` vars to **Production** scope. For previews,
   either point them at production remotes (recommended) or leave unset
   to use the localhost fallback (only works if you're hitting the shell
   from a machine running the dev remotes).

6. **Save and Deploy.** First deploy takes 1–3 minutes.

---

## Step 2 — Create the product-config Pages project

Same as Step 1, but:

- Project name: `mfe-product-config`
- **Root directory:** `apps/product-config`
- Build command: `pnpm install --frozen-lockfile && pnpm --filter product-config build`
- Build output directory: `dist`
- Environment variables:

  | Name | Value | Scope |
  |---|---|---|
  | `NODE_VERSION` | `20` | Plaintext |
  | `PNPM_VERSION` | `9.12.0` | Plaintext |
  | `PUBLIC_ASSET_PREFIX` | `https://product-config.mfe.example.com` | Production only |

  Leave `PUBLIC_ASSET_PREFIX` unset for preview environments — Cloudflare
  sets `CF_PAGES_URL` automatically, and the rsbuild config falls back to
  it, so preview deploys self-host their own assets.

---

## Step 3 — Create the underwriting Pages project

Same again, but:

- Project name: `mfe-underwriting`
- **Root directory:** `apps/underwriting`
- Build command: `pnpm install --frozen-lockfile && pnpm --filter underwriting build`
- Build output directory: `dist`
- Environment variables:

  | Name | Value | Scope |
  |---|---|---|
  | `NODE_VERSION` | `20` | Plaintext |
  | `PNPM_VERSION` | `9.12.0` | Plaintext |
  | `PUBLIC_ASSET_PREFIX` | `https://underwriting.mfe.example.com` | Production only |

---

## Step 4 — Attach custom domains

For each project: **Custom domains → Set up a custom domain**.

1. Shell project → `app.example.com`.
2. product-config project → `product-config.mfe.example.com`.
3. underwriting project → `underwriting.mfe.example.com`.

If your DNS is on Cloudflare, the records are added automatically. If
your DNS is elsewhere, add the CNAMEs Cloudflare prints (typically
`<project>.pages.dev`). Cloudflare auto-issues TLS certs once DNS
propagates.

---

## Step 5 — Verify the first deploy

### Check the remotes

```bash
# Manifest should be JSON
curl -i https://product-config.mfe.example.com/mf-manifest.json

# Verify CORS + cache headers came through from _headers
curl -I https://product-config.mfe.example.com/mf-manifest.json
# Expect:
#   access-control-allow-origin: *
#   cache-control: public, max-age=0, s-maxage=60, must-revalidate
```

Open the JSON. `metaData.publicPath` should be
`https://product-config.mfe.example.com/`. If it's `/` or a `*.pages.dev`
URL, your `PUBLIC_ASSET_PREFIX` env var didn't get through — fix it and
trigger a redeploy.

### Check the shell

Open `https://app.example.com` and sign in as Tenant A:

- **Network tab:** manifest fetches go to
  `https://product-config.mfe.example.com/mf-manifest.json` (200).
- `remoteEntry.js` and chunks are 200, from the remote's origin.
- Navigate to `/product-config` — catalog renders, sub-sidebar shows
  Catalog + Settings.
- Hard-refresh on `/underwriting/UW-1042` (deep link) — the `_redirects`
  file makes this land on the right page; without it you'd get 404.
- Switch tenant to Tenant B — only Product Config is entitled.

---

## Step 6 — Tighten security before production

Open each remote's `cloudflare/_headers` file and change
`Access-Control-Allow-Origin` from `*` to your production shell origin:

```
/mf-manifest.json
  Access-Control-Allow-Origin: https://app.example.com
  Cache-Control: public, max-age=0, s-maxage=60, must-revalidate

/remoteEntry.js
  Access-Control-Allow-Origin: https://app.example.com
  Cache-Control: public, max-age=0, s-maxage=60, must-revalidate

/static/*
  Access-Control-Allow-Origin: https://app.example.com
  Cache-Control: public, max-age=31536000, immutable
```

For preview environments, you can keep `*` — preview shells can't be
allow-listed in advance (their hostnames vary per deploy).

Consider also adding a Content Security Policy to `apps/shell/cloudflare/_headers`:

```
/index.html
  Cache-Control: public, max-age=0, s-maxage=60, must-revalidate
  Content-Security-Policy: default-src 'self'; script-src 'self' https://*.mfe.example.com; connect-src 'self' https://*.mfe.example.com; style-src 'self' 'unsafe-inline';
```

---

## Day-2 operations

### Shipping a remote update

1. Merge a PR touching `apps/<remote>/` to main.
2. Cloudflare auto-builds that project. The shell project is NOT rebuilt
   (Cloudflare only rebuilds the project whose build command sees changes
   in its output — but it's not as smart as Vercel about it). If you want
   to avoid unnecessary builds, see "Skip unnecessary builds" below.
3. New manifest is live; users see the new version on next manifest
   revalidation (60s with the cache headers above).

### Rolling back a remote

Cloudflare Dashboard → the remote's project → **Deployments** → previous
good deployment → **Rollback to this deployment**. Live within ~60s.

The shell isn't redeployed; it just resolves the same URL and gets the
older manifest.

### Skip unnecessary builds (optional)

Cloudflare Pages doesn't have a first-class "Ignored Build Step" like
Vercel, but you can short-circuit the build with a small wrapper. Add
this script (it uses Nx's affected graph):

```bash
# scripts/cf-skip.sh
#!/usr/bin/env sh
# Exit 0 (skip build) if Nx says the named project is unaffected by the
# diff between the last deployed commit and HEAD.
PROJECT=$1
if [ -z "$CF_PAGES_COMMIT_SHA" ] || [ -z "$1" ]; then exit 1; fi
LAST=$(git rev-parse HEAD~1)
AFFECTED=$(pnpm nx show projects --affected --base="$LAST" --head=HEAD 2>/dev/null | grep -c "^$PROJECT$" || true)
if [ "$AFFECTED" = "0" ]; then echo "skip: $PROJECT unaffected"; exit 0; fi
exit 1
```

Then change each project's build command to:

```
sh scripts/cf-skip.sh <project> || (pnpm install --frozen-lockfile && pnpm --filter <project> build)
```

Skip if unaffected; otherwise build. Three caveats: (1) Cloudflare still
runs the install step, (2) the diff is HEAD~1, not "last successful
deploy" — close enough for most cases, (3) for a small workspace like
this, the build is fast and skipping it isn't worth the complexity.

### Testing a draft remote inside the production shell

Append a query param to the production shell URL:

```
https://app.example.com/?remote_underwriting=https://<commit-sha>.mfe-underwriting.pages.dev/mf-manifest.json
```

The shell's resolver picks this up over the env var. Gate behind an admin
flag in `createRemoteUrlResolver` before going live so customers can't
override URLs.

### Per-branch previews

Cloudflare Pages auto-deploys every branch to
`https://<branch>.<project>.pages.dev`. Preview deploys self-host their
own assets (because of the `CF_PAGES_URL` fallback), so they work in
isolation. To test the shell preview against a specific remote preview,
use the query param above.

---

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Shell loads but remote chunks 404 | `PUBLIC_ASSET_PREFIX` missing on production deploy | Set the env var on the remote's Pages project (Production scope), redeploy |
| `CORS error` on manifest fetch | `_headers` not copied to dist | Verify `cloudflare/_headers` exists in the source and `output.copy` is configured; rebuild and inspect `dist/_headers` |
| Deep link returns 404 | Shell missing `_redirects` | Verify `apps/shell/cloudflare/_redirects` exists and gets copied to dist |
| Build fails: `command not found: pnpm` | `PNPM_VERSION` not set | Set `PNPM_VERSION` env var to `9.12.0` on every project |
| Build fails: Node 18 used despite Node 20 in code | Cloudflare default Node is older | Set `NODE_VERSION=20` env var on every project |
| Deploy step fails: "Wrangler application detection logic has been run in the root of a workspace" | Cloudflare's Root Directory is set to repo root, not the app dir | Set Root Directory to `apps/<app>` per project; verify `wrangler.jsonc` exists in each app dir |
| Deploy step fails: "Missing entry-point to Worker script or to assets directory" | `wrangler.jsonc` uses the deprecated `pages_build_output_dir` field | Replace with `"assets": { "directory": "./dist" }`; add `not_found_handling: "single-page-application"` for the shell |
| Deploy step fails: "Invalid _redirects configuration: Infinite loop detected" | `_redirects` file with `/* /index.html 200` conflicts with `not_found_handling: "single-page-application"` | Delete `apps/shell/cloudflare/_redirects` — `not_found_handling` already provides SPA fallback |
| Install fails: `ERR_PNPM_OUTDATED_LOCKFILE` | `package.json` changed without committing `pnpm-lock.yaml` | Run `pnpm install` locally and commit both files together |
| Manifest never updates after deploy | Browser caching | Hard refresh; verify `Cache-Control: s-maxage=60` in response headers |
| `factory is undefined` in browser | Singleton version drift across apps | Pin React (and react-router-dom) to the same version in every app's `package.json`; bump together |
| Preview deploy chunks load from wrong host | `CF_PAGES_URL` not set | This is automatic for branch deploys; only an issue if you somehow override the env. Check Pages build logs. |

---

## What's still missing (production hardening)

- **Sourcemap upload** to your error tracker per remote build.
- **Stricter CSP** once you've enumerated origins.
- **Per-tenant remote URL resolution** — today the URLs are static env
  vars. The architecture supports per-tenant overrides at runtime via the
  entitlements API; wire that up when canarying or per-customer pinning
  matters.
- **Compatibility-matrix CI** — a Playwright job that loads each remote's
  production manifest into a built shell, fails on console errors.
- **Tighten `Access-Control-Allow-Origin`** as described in Step 6.

These are incremental — none block the first deploy.
