import { Card, PageHeader } from "@workspace/design-system";

export function NotEntitled({ label }: { label: string }) {
  return (
    <div>
      <PageHeader title="Not entitled" subtitle={label} />
      <Card>
        Your tenant doesn’t have access to <strong>{label}</strong>. Speak to your
        workspace administrator if you believe this is a mistake.
      </Card>
    </div>
  );
}

export function ModuleNotAvailable({ label }: { label: string }) {
  return (
    <div>
      <PageHeader title="Coming soon" subtitle={label} />
      <Card>
        <strong>{label}</strong> is on the roadmap but isn’t built yet.
      </Card>
    </div>
  );
}
