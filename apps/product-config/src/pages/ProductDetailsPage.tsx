import { Card, PageHeader, Badge, Stack } from "@workspace/design-system";
import { Link, useParams } from "react-router-dom";

export function ProductDetailsPage() {
  const { id } = useParams();
  return (
    <div>
      <PageHeader
        title={id ?? "Unknown product"}
        subtitle="Product details"
        actions={<Link to="..">← Back to catalog</Link>}
      />
      <Card>
        <Stack gap={8}>
          <Badge tone="ok">Active</Badge>
          <p style={{ margin: 0 }}>
            This page is rendered by the <strong>product-config</strong> remote and
            mounted inside the shell. The shell never imported its code at build time.
          </p>
        </Stack>
      </Card>
    </div>
  );
}
