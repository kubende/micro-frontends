import { loadRemote, registerRemotes } from "@module-federation/runtime";
import type {
  CatalogEntry,
  Entitlements,
  RemoteModule,
  RemoteUrlResolver,
} from "@workspace/contracts";

/**
 * Registers exactly the remotes this tenant is entitled to. Modules without
 * a `remoteName` (not yet built) are skipped. Unknown URLs (resolver returns
 * undefined) are skipped — the module renders as "Not available".
 *
 * Uses `registerRemotes` (not `init`) so we add to the federation runtime
 * the Rsbuild plugin already configured, instead of re-initialising it and
 * losing the eager shared-scope providers.
 */
export function registerEntitledRemotes(
  catalog: CatalogEntry[],
  entitlements: Entitlements,
  resolveUrl: RemoteUrlResolver,
) {
  const remotes = catalog
    .filter((m) => entitlements.modules.includes(m.id) && m.remoteName)
    .map((m) => {
      const entry = resolveUrl(m.remoteName!);
      return entry ? { name: m.remoteName!, entry, alias: m.remoteName! } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  registerRemotes(remotes, { force: true });
}

export async function loadRemoteModule(remoteName: string, exposed: string) {
  const mod = await loadRemote<{ default: RemoteModule } | RemoteModule>(
    `${remoteName}/${exposed.replace(/^\.\//, "")}`,
  );
  if (!mod) throw new Error(`Remote "${remoteName}" failed to load`);
  const value = (mod as { default?: RemoteModule }).default ?? (mod as RemoteModule);
  if (!value.Root || !Array.isArray(value.routes)) {
    throw new Error(
      `Remote "${remoteName}" does not satisfy RemoteModule contract`,
    );
  }
  return value;
}
