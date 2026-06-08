import type { ComponentType } from "react";
import type { RouteObject } from "react-router-dom";
/**
 * The contract every remote must satisfy. A remote's federated entry
 * exposes `./routes` as the default export of this shape — the shell mounts
 * `Root` under the remote's base path with `children` from `routes`.
 */
export type RemoteModule = {
    Root: ComponentType;
    routes: RouteObject[];
};
export type ModuleId = "product-config" | "underwriting" | "claims" | "finance" | "reinsurance";
export type CatalogEntry = {
    id: ModuleId;
    label: string;
    path: string;
    icon?: string;
    /** Federation remote name, e.g. "product_config". Absent => not yet built. */
    remoteName?: string;
    /** Federated module path exposed by the remote, e.g. "./routes". */
    exposed?: string;
};
export type TenantId = string;
export type Entitlements = {
    tenantId: TenantId;
    modules: ModuleId[];
};
/**
 * Per-tenant runtime resolution of remote URLs. The shell asks
 * `resolveRemoteUrl(remoteName)` at login and registers federation entries.
 */
export type RemoteUrlResolver = (remoteName: string) => string | undefined;
export type SessionUser = {
    id: string;
    name: string;
    email: string;
    tenantId: TenantId;
};
