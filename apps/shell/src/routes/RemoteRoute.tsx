import { lazy, Suspense, useEffect, useMemo } from "react";
import { useRoutes, type RouteObject } from "react-router-dom";
import type { CatalogEntry, RemoteModule } from "@workspace/contracts";
import { loadRemoteModule } from "../remoteRegistry";
import { useSession } from "../store";
import { RemoteBoundary } from "../components/RemoteBoundary";
import { ModuleNotAvailable, NotEntitled } from "../components/NotEntitled";

/**
 * Mounts a remote module under its catalog path. Lazy + Suspense so the remote
 * bundle is fetched only when the user first navigates here. The remote owns
 * everything under this route.
 */
export function RemoteRoute({ entry }: { entry: CatalogEntry }) {
  // All hooks must run on every render — never gate them behind early returns,
  // or the hook count diverges between renders (e.g. on tenant switch).
  const entitled = useSession((s) => s.isEntitled(entry.id));
  const Mounted = useMemo(
    () =>
      entry.remoteName && entry.exposed
        ? lazy(async () => {
            const mod: RemoteModule = await loadRemoteModule(
              entry.remoteName!,
              entry.exposed!,
            );
            const tree: RouteObject[] = [{ element: <mod.Root />, children: mod.routes }];
            return { default: () => <RemoteContent entry={entry} mod={mod} tree={tree} /> };
          })
        : null,
    [entry.remoteName, entry.exposed, entry.id],
  );

  if (!entitled) return <NotEntitled label={entry.label} />;
  if (!Mounted) return <ModuleNotAvailable label={entry.label} />;

  return (
    <RemoteBoundary moduleLabel={entry.label}>
      <Suspense fallback={<div>Loading {entry.label}…</div>}>
        <Mounted />
      </Suspense>
    </RemoteBoundary>
  );
}

/**
 * Publishes the loaded module's sub-nav into the session store on mount,
 * and clears it on unmount (only if this module still owns the slot —
 * guards against an unmounting effect wiping the next module's nav during
 * a fast route swap).
 */
function RemoteContent({
  entry,
  mod,
  tree,
}: {
  entry: CatalogEntry;
  mod: RemoteModule;
  tree: RouteObject[];
}) {
  const setActiveSubNav = useSession((s) => s.setActiveSubNav);
  const clearActiveSubNav = useSession((s) => s.clearActiveSubNav);

  useEffect(() => {
    setActiveSubNav({
      moduleId: entry.id,
      basePath: entry.path,
      items: mod.subNav ?? [],
    });
    return () => clearActiveSubNav(entry.id);
  }, [entry.id, entry.path, mod, setActiveSubNav, clearActiveSubNav]);

  return useRoutes(tree);
}
