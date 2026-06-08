# Insurer Workspace — Module Federation sample

A working scaffold for the architecture in the doc: one **Shell (host)** that
composes independently-built **Remotes** at runtime, with shared packages,
runtime entitlement gating, failure isolation, and Nx-enforced boundaries.

## Layout

```
apps/
  shell/             # Host — owns layout, header, sidebar, routing, registry, store
  product-config/    # Remote — exposes ./routes via Module Federation
  underwriting/      # Remote — exposes ./routes via Module Federation
packages/
  contracts/         # Shared types — the RemoteModule contract every remote satisfies
  design-system/     # Shared UI building blocks (singleton across the workspace)
```

## Run it

```
pnpm install
pnpm dev          # starts shell + both remotes in parallel
```

Open <http://localhost:3000>.

Ports:

| App            | Port  |
| -------------- | ----- |
| shell          | 3000  |
| product-config | 3001  |
| underwriting   | 3002  |

You can also run a remote standalone (without the shell) on its own port.

`pnpm dev` runs a `predev` hook that frees ports 3000–3003 first, so a stale
process from a previous run won't block startup (the symptom is a "Failed to
fetch mf-manifest.json" error in the shell when a remote fails to bind).

If the federation runtime starts behaving weirdly after a lot of HMR cycles,
nuke caches:

```
pnpm clean && pnpm dev
```

## What to look for

- **Tenant switch (top-right of the header)** — Tenant A sees Product Config,
  Underwriting, and Claims; Tenant B sees only Product Config. Same shell, no
  rebuild. Sidebar items dim when not entitled.
- **Claims** — entitled for Tenant A but no remote is built yet — lands on a
  "Coming soon" page. Demonstrates the catalog/entitlement/remote split.
- **Remote failure isolation** — kill `product-config` (`pnpm dev:underwriting`
  + `pnpm dev:shell` only) and navigate to `/product-config`: the
  `RemoteBoundary` shows a self-contained error, the rest of the workspace
  keeps working.
- **Independent remote deploys** — change a file in `apps/underwriting`, rebuild
  *only* that remote, redeploy — the shell picks it up on next load. No shell
  rebuild required.

## How a module loads

1. `App.tsx` calls `login(tenantId)` to fetch user + entitlements.
2. `registerEntitledRemotes(...)` registers only the entitled remotes with the
   federation runtime, using a per-tenant URL resolver
   (`createRemoteUrlResolver`).
3. The shell defines a `/<module-path>/*` route for every catalog entry.
4. `RemoteRoute` checks entitlement, then lazy-loads the remote's `./routes`
   export and mounts it inside a `RemoteBoundary`. The remote owns everything
   under its base path.

The shell never statically imports a remote — that is the whole point.

## Boundaries (enforced)

The Nx tags in each `project.json` are enforced by
`@nx/enforce-module-boundaries` in `.eslintrc.json`:

| Source       | May depend on    |
| ------------ | ---------------- |
| `scope:shared` | `scope:shared` only |
| `scope:shell`  | `scope:shared` only — never a remote |
| `scope:remote` | `scope:shared` only — never another remote or the shell |

A cross-remote import or a shell→remote import fails `pnpm lint`.

## Deployment

Pick your platform:

- **Vercel** → see [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Cloudflare Pages** → see [CLOUDFLARE.md](./CLOUDFLARE.md)

Both use the same shape: three projects (one per app), same Git repo. The
shell reads remote URLs from `PUBLIC_*` env vars; each remote serves its own
assets from its own origin via `PUBLIC_ASSET_PREFIX`. The platform-specific
config files (`vercel.json` for Vercel; `cloudflare/_headers` + `_redirects`
for Cloudflare) live alongside each app.

## Stack

- **pnpm Workspaces** — share `@workspace/*` packages with no publish step
- **Nx** — task graph, caching, affected, boundary enforcement
- **Rsbuild (Rspack)** — bundler for shell + every remote
- **Module Federation** — runtime composition + shared singletons
- **Zustand** — singleton session/entitlements store, shared across shell + remotes
- **React Router** — singleton router, shared across shell + remotes
