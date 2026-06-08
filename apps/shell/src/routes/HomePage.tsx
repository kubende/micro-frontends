import { Card, PageHeader, Stack, Badge } from "@workspace/design-system";
import { CATALOG } from "../catalog";
import { useSession } from "../store";
import { Link } from "react-router-dom";

export function HomePage() {
  const entitlements = useSession((s) => s.entitlements);
  return (
    <div>
      <PageHeader
        title="Welcome"
        subtitle={`Signed in to ${entitlements?.tenantId ?? "—"}`}
      />
      <Stack gap={12}>
        {CATALOG.map((m) => {
          const entitled = entitlements?.modules.includes(m.id);
          const built = !!m.remoteName;
          return (
            <Card key={m.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{m.label}</strong>
                  <div style={{ color: "#64748b", font: "13px system-ui" }}>{m.path}</div>
                </div>
                <Stack direction="row" gap={8} align="center">
                  <Badge tone={entitled ? "ok" : "neutral"}>
                    {entitled ? "Entitled" : "Not entitled"}
                  </Badge>
                  <Badge tone={built ? "info" : "warn"}>
                    {built ? "Remote available" : "Not built"}
                  </Badge>
                  <Link to={m.path}>Open →</Link>
                </Stack>
              </div>
            </Card>
          );
        })}
      </Stack>
    </div>
  );
}
