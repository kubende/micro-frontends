import { useSession } from "../store";
import { Badge } from "@workspace/design-system";

export function Header({ onSwitchTenant }: { onSwitchTenant: (id: string) => void }) {
  const user = useSession((s) => s.user);
  const entitlements = useSession((s) => s.entitlements);

  return (
    <header
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <strong style={{ font: "600 16px system-ui" }}>Insurer Workspace</strong>
        <Badge tone="info">Module Federation</Badge>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <select
          value={entitlements?.tenantId ?? ""}
          onChange={(e) => onSwitchTenant(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6 }}
        >
          <option value="tenant-a">Tenant A (PC + UW + Claims)</option>
          <option value="tenant-b">Tenant B (PC only)</option>
        </select>
        {user && <span style={{ color: "#475569", font: "14px system-ui" }}>{user.name}</span>}
      </div>
    </header>
  );
}
