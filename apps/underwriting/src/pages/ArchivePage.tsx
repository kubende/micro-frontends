import { Card, PageHeader, Stack, Badge } from "@workspace/design-system";

const ARCHIVED = [
  { id: "UW-0987", applicant: "P. Yamamoto", decision: "approved" as const },
  { id: "UW-0988", applicant: "R. Nascimento", decision: "declined" as const },
];

const tones = { approved: "ok", declined: "warn" } as const;

export function ArchivePage() {
  return (
    <div>
      <PageHeader title="Archive" subtitle="Closed cases" />
      <Stack>
        {ARCHIVED.map((c) => (
          <Card key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{c.id}</strong>
                <div style={{ color: "#64748b", font: "13px system-ui" }}>{c.applicant}</div>
              </div>
              <Badge tone={tones[c.decision]}>{c.decision}</Badge>
            </div>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
