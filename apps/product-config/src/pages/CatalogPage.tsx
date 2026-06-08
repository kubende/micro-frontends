import { Card, PageHeader, Stack, Button } from "@workspace/design-system";
import { Link } from "react-router-dom";

const PRODUCTS = [
  { id: "p-001", name: "Motor — Standard" },
  { id: "p-002", name: "Motor — Premium" },
  { id: "p-003", name: "Home — Buildings" },
];

export function CatalogPage() {
  return (
    <div>
      <PageHeader
        title="Product Catalog"
        subtitle="Owned by Team Product"
        actions={<Button>New product</Button>}
      />
      <Stack>
        {PRODUCTS.map((p) => (
          <Card key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{p.name}</strong>
                <div style={{ color: "#64748b", font: "13px system-ui" }}>{p.id}</div>
              </div>
              <Link to={p.id}>Open →</Link>
            </div>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
