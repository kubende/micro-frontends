# Deploying to Vercel

Step-by-step guide to take this workspace from local dev to production on
Vercel. You will create **three Vercel projects** (one per app) backed by the
same Git repository, distinguished only by their Root Directory.

---

## What's already in the repo for you

The following files and code changes are already in place — you don't have
to write any of this:

- `apps/shell/src/entitlements.ts` reads remote URLs from `PUBLIC_*` env
  vars, falls back to localhost for dev, and honours a
  `?remote_<name>=<url>` query param so you can point the production shell
  at a preview remote.
- `apps/product-config/rsbuild.config.ts` and
  `apps/underwriting/rsbuild.config.ts` set `output.assetPrefix` from
  `PUBLIC_ASSET_PREFIX` (with a `VERCEL_URL` fallback for previews).
- `vercel.json` per app: CORS + cache headers for the remotes, SPA rewrites
  for the shell.
- `.vercelignore` per app.
- `nx-ignore` in the root `devDependencies` for the Vercel "Ignored Build
  Step" — Vercel will skip a project's build when nothing in its affected
  graph changed.

All you need to do is the Vercel UI/CLI work below.

---

## Step 0 — Prerequisites

1. A Vercel account with permission to create projects.
2. The repo pushed to GitHub/GitLab/Bitbucket. Vercel needs Git access for
   automatic per-PR previews.
3. The three production domains you intend to use. Worked example:

   | Project | Production domain |
   |---|---|
   | Shell | `app.example.com` |
   | product-config | `product-config.mfe.example.com` |
   | underwriting | `underwriting.mfe.example.com` |

   Each remote on its own subdomain keeps CORS, caching, and rollback
   isolated. Do **not** put remotes under the shell's domain.

4. DNS access for the parent domain (`example.com`) so you can add CNAMEs.

---

## Step 1 — Create the shell project on Vercel

1. **Add New → Project** → import your Git repo.
2. **Project Name:** `insurer-shell` (whatever you like).
3. **Root Directory:** `apps/shell`.
4. **Framework Preset:** Other.
5. **Build & Output Settings → Override:**
   - Install Command: leave default (Vercel auto-detects pnpm workspaces
     and runs `pnpm install` at the repo root).
   - Build Command: `pnpm --filter shell build`
   - Output Directory: `dist`
6. **Node.js Version:** 20.x (Settings → General after creation).
7. **Ignored Build Step** (Settings → Git): `npx nx-ignore shell`
8. **Don't deploy yet** — you need env vars first (Step 4). Cancel the
   first auto-deploy if it starts.

---

## Step 2 — Create the product-config project

Same as Step 1, but:

- Project Name: `mfe-product-config`
- Root Directory: `apps/product-config`
- Build Command: `pnpm --filter product-config build`
- Ignored Build Step: `npx nx-ignore product-config`

---

## Step 3 — Create the underwriting project

Same again, but:

- Project Name: `mfe-underwriting`
- Root Directory: `apps/underwriting`
- Build Command: `pnpm --filter underwriting build`
- Ignored Build Step: `npx nx-ignore underwriting`

---

## Step 4 — Configure environment variables

Set these in each project: **Settings → Environment Variables**.

### Shell project

| Name | Production value | Preview value |
|---|---|---|
| `PUBLIC_REMOTE_PRODUCT_CONFIG` | `https://product-config.mfe.example.com/mf-manifest.json` | same (or leave empty for VERCEL_URL fallback) |
| `PUBLIC_REMOTE_UNDERWRITING` | `https://underwriting.mfe.example.com/mf-manifest.json` | same |

Set scope to **Production** (and **Preview** if you want preview shells to
point at production remotes — common pattern). Don't set it for
Development.

### product-config project

| Name | Production value |
|---|---|
| `PUBLIC_ASSET_PREFIX` | `https://product-config.mfe.example.com` |

Set scope to **Production only**. Leave Preview unset so preview builds
use the auto-fallback to `https://${VERCEL_URL}`.

### underwriting project

| Name | Production value |
|---|---|
| `PUBLIC_ASSET_PREFIX` | `https://underwriting.mfe.example.com` |

Same: Production only.

---

## Step 5 — Add custom domains

For each project: **Settings → Domains → Add**.

1. Shell project: add `app.example.com`.
2. product-config project: add `product-config.mfe.example.com`.
3. underwriting project: add `underwriting.mfe.example.com`.

Vercel will print the DNS records you need to add. Typically:

```
app.example.com               CNAME  cname.vercel-dns.com
product-config.mfe.example.com CNAME cname.vercel-dns.com
underwriting.mfe.example.com   CNAME cname.vercel-dns.com
```

Add them at your DNS provider. Vercel auto-issues TLS certs once DNS
propagates (a few minutes typically).

---

## Step 6 — First deploy

1. Push a commit to your default branch (or trigger a redeploy from the
   Vercel UI on each project).
2. Vercel builds all three projects in parallel.
3. Verify each build's logs show no errors. The first build of every
   project will run (nx-ignore can't compare against history yet).

### Sanity-check the remotes

```bash
# Manifest should be JSON
curl -i https://product-config.mfe.example.com/mf-manifest.json

# Verify CORS and cache headers
# Expected: Access-Control-Allow-Origin, Cache-Control with s-maxage=60
curl -I https://product-config.mfe.example.com/mf-manifest.json
```

Open the JSON. The chunk URLs under `exposes` should be **relative**, and
`metaData.publicPath` should be `https://product-config.mfe.example.com/`.
If `publicPath` is `/`, your `PUBLIC_ASSET_PREFIX` env var didn't get
through — the shell will 404 on chunks.

### Sanity-check the shell

Open `https://app.example.com`. Sign in as Tenant A:

- Network tab: the manifest fetches should hit
  `https://product-config.mfe.example.com/mf-manifest.json` (200).
- The `remoteEntry.js` and chunks should also be 200, from the remote's
  origin.
- Navigate to `/product-config` — the catalog renders, sub-sidebar shows
  Catalog + Settings.
- Switch tenant to Tenant B — only Product Config is entitled; the
  Underwriting nav item dims and clicking it shows "Not entitled".

---

## Step 7 — Tighten security headers (recommended before production)

Open each remote's `vercel.json` and change `Access-Control-Allow-Origin`
from `"*"` to your shell's exact origin:

```json
{ "key": "Access-Control-Allow-Origin", "value": "https://app.example.com" }
```

For preview environments, you can keep `*` or use multiple origins via a
deployment-aware build step. The principle: production should only allow
the production shell to fetch the production remote.

You may also want to add Content Security Policy headers to
`apps/shell/vercel.json`:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' https://*.mfe.example.com; connect-src 'self' https://*.mfe.example.com; style-src 'self' 'unsafe-inline';"
}
```

Tighten further once you know exactly what each remote needs.

---

## Day-2 operations

### Shipping a remote update

1. Open PR with changes scoped to that remote.
2. Vercel auto-builds a preview for that project only (nx-ignore skips
   the others).
3. Test the preview standalone, or point the production shell at it
   with `?remote_underwriting=<preview-url>/mf-manifest.json`.
4. Merge → Vercel promotes to production.
5. Manifest TTL is 60s, so users on the workspace see the new version
   within a minute. No shell change needed.

### Rolling back a remote

Vercel Dashboard → the remote project → **Deployments** → previous good
deployment → **Promote to Production**. Live within 60s.

The shell isn't redeployed; the URL it points at simply serves an older
manifest.

### Shipping a shell update

Same Git flow. The shell deploys independently of remotes. Test against
production remotes via the shell's preview URL.

### Testing a draft remote inside the production shell

The shell honours `?remote_<name>=<url>` query params. Example:

```
https://app.example.com/?remote_underwriting=https://mfe-underwriting-git-feature-foo-myteam.vercel.app/mf-manifest.json
```

Before going to production, gate this behind an admin flag in
`createRemoteUrlResolver` so customers can't override URLs.

### Bumping a shared singleton (React, react-router-dom)

This is a coordinated change — see the contract-change policy. Update the
version in **all** `apps/*/package.json` simultaneously, merge, and let
all three projects rebuild and redeploy at once.

---

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Shell loads but remote chunks 404 | Missing `PUBLIC_ASSET_PREFIX` on the remote project | Add the env var, redeploy that project |
| `CORS error: Access-Control-Allow-Origin missing` | Remote's `vercel.json` missing or not deployed | Verify the file is in the remote's Root Directory and redeploy |
| Manifest never updates after a deploy | Browser caching the JSON | Hard refresh (`Cmd+Shift+R`); verify `Cache-Control: s-maxage=60` on the manifest response |
| New remote version live but old chunks still served | Hashed chunks are cached, fine — the new manifest references the new hashes | No fix; verify by checking the manifest's `publicPath` and chunk filenames |
| `factory is undefined` in browser | Singleton version drift across apps | Pin React (and react-router-dom) to the same version in every app's `package.json` |
| One project's build never runs | `nx-ignore` over-aggressively skipping | Check Vercel build logs for the skip reason; force a redeploy from the UI to override |
| Preview shell can't load preview remote | CORS not allowing preview origin | Either keep `*` until you go to prod, or generate `vercel.json` with the preview origin in CI |

---

## What's still missing (production hardening)

This guide gets you running on Vercel safely. Before serving real
customers, also consider:

- **Sourcemap upload** to your error tracker (Sentry, etc.) per remote
  build.
- **Stricter CSP** once you've enumerated the exact origins each remote
  needs.
- **Per-tenant remote URL resolution** — today the URLs are static env
  vars. The architecture supports per-tenant overrides at runtime via the
  entitlements API; wire that up when canarying or per-customer pinning
  matters.
- **Compatibility-matrix CI** — a Playwright job that loads each remote's
  production manifest into a built shell, fails on console errors. Catches
  contract drift before it reaches users.
- **Tighten `Access-Control-Allow-Origin`** as described in Step 7.

These are all incremental — none of them block the first deploy.
