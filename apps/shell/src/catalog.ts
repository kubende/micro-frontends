import type { CatalogEntry } from "@workspace/contracts";

/**
 * Everything the shell *knows about*, whether or not any given tenant is
 * entitled, and whether or not the remote is built yet. Entries without
 * `remoteName` represent modules on the roadmap — navigation can still
 * reference them; clicking lands on the "Not entitled / not available" page.
 */
export const CATALOG: CatalogEntry[] = [
  {
    id: "product-config",
    label: "Product Config",
    path: "/product-config",
    icon: "PC",
    remoteName: "product_config",
    exposed: "./routes",
  },
  {
    id: "underwriting",
    label: "Underwriting",
    path: "/underwriting",
    icon: "UW",
    remoteName: "underwriting",
    exposed: "./routes",
  },
  // Known but not built — entitled tenants land on a "Coming soon" page.
  { id: "claims", label: "Claims", path: "/claims", icon: "CL" },
  { id: "finance", label: "Finance", path: "/finance", icon: "FI" },
  { id: "reinsurance", label: "Reinsurance", path: "/reinsurance", icon: "RE" },
];
