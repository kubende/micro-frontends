import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CATALOG } from "./catalog";
import { useSession } from "./store";
import { createRemoteUrlResolver, login } from "./entitlements";
import { registerEntitledRemotes } from "./remoteRegistry";
import { Layout } from "./components/Layout";
import { HomePage } from "./routes/HomePage";
import { RemoteRoute } from "./routes/RemoteRoute";

export function App() {
  const setSession = useSession((s) => s.setSession);
  const [tenantId, setTenantId] = useState("tenant-a");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    login(tenantId).then(({ user, entitlements }) => {
      registerEntitledRemotes(CATALOG, entitlements, createRemoteUrlResolver(tenantId));
      setSession(user, entitlements);
      setReady(true);
    });
  }, [tenantId, setSession]);

  if (!ready) return <div style={{ padding: 24 }}>Signing in…</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onSwitchTenant={setTenantId} />}>
          <Route index element={<HomePage />} />
          {CATALOG.map((m) => (
            <Route key={m.id} path={`${m.path}/*`} element={<RemoteRoute entry={m} />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
