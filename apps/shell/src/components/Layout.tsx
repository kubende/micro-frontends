import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SubSidebar } from "./SubSidebar";

export function Layout({ onSwitchTenant }: { onSwitchTenant: (id: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header onSwitchTenant={onSwitchTenant} />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar />
        <SubSidebar />
        <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
