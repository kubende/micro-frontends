import { Outlet } from "react-router-dom";
import type { RemoteModule } from "@workspace/contracts";
import { CatalogPage } from "../pages/CatalogPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { SettingsPage } from "../pages/SettingsPage";

function Root() {
  return <Outlet />;
}

const remote: RemoteModule = {
  Root,
  routes: [
    { index: true, element: <CatalogPage /> },
    { path: "settings", element: <SettingsPage /> },
    { path: ":id", element: <ProductDetailsPage /> },
  ],
  subNav: [
    { label: "Catalog", path: "", end: true },
    { label: "Settings", path: "settings" },
  ],
};

export default remote;
