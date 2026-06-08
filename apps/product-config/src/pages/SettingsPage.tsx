import { Card, PageHeader, Stack } from "@workspace/design-system";

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Product Config" />
      <Stack>
        <Card>
          <strong>Default underwriting rules</strong>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>
            Applied when a product doesn’t override.
          </p>
        </Card>
        <Card>
          <strong>Number formats</strong>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>
            Decimal precision and currency rendering.
          </p>
        </Card>
      </Stack>
    </div>
  );
}
