import type { Entitlements, RemoteUrlResolver, SessionUser } from "@workspace/contracts";

/**
 * Mocks a login. In production this is two API calls — one for the user/session,
 * one for the tenant's entitlements + remote URL map. They are kept separate
 * here so the shape mirrors how a real backend would split them.
 */
const TENANTS: Record<string, { user: SessionUser; entitlements: Entitlements }> = {
  "tenant-a": {
    user: {
      id: "u1",
      name: "Alex Adler",
      email: "alex@tenant-a.test",
      tenantId: "tenant-a",
    },
    entitlements: {
      tenantId: "tenant-a",
      modules: ["product-config", "underwriting", "claims"],
    },
  },
  "tenant-b": {
    user: {
      id: "u2",
      name: "Bea Brooks",
      email: "bea@tenant-b.test",
      tenantId: "tenant-b",
    },
    entitlements: { tenantId: "tenant-b", modules: ["product-config"] },
  },
};

export async function login(tenantId: string) {
  const row = TENANTS[tenantId];
  if (!row) throw new Error(`Unknown tenant: ${tenantId}`);
  return row;
}

/**
 * Per-tenant remote URL resolver. Pulls production URLs from `PUBLIC_*`
 * env vars (inlined by Rsbuild at build time), falls back to localhost dev
 * URLs, and honours a `?remote_<name>=<url>` query param so a developer or
 * QA can point the shell at a preview deploy of a single remote without
 * rebuilding.
 */
export function createRemoteUrlResolver(_tenantId: string): RemoteUrlResolver {
  const urls: Record<string, string | undefined> = {
    product_config:
      process.env.PUBLIC_REMOTE_PRODUCT_CONFIG ||
      "http://localhost:3001/mf-manifest.json",
    underwriting:
      process.env.PUBLIC_REMOTE_UNDERWRITING ||
      "http://localhost:3002/mf-manifest.json",
  };

  if (typeof window !== "undefined") {
    const qs = new URLSearchParams(window.location.search);
    for (const key of Object.keys(urls)) {
      const override = qs.get(`remote_${key}`);
      if (override) urls[key] = override;
    }
  }

  return (remoteName) => urls[remoteName];
}
