import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes, type RouteObject } from "react-router-dom";
import "@workspace/design-system/styles.css";
import remote from "./expose/routes";

const tree: RouteObject[] = [{ element: <remote.Root />, children: remote.routes }];

function App() {
  return useRoutes(tree);
}

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");
createRoot(container).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
