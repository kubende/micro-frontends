import { Card, PageHeader, Stack, Badge } from "@workspace/design-system";
import { Link } from "react-router-dom";

const CASES = [
  { id: "UW-1042", applicant: "C. Sandoval", risk: "low" as const },
  { id: "UW-1043", applicant: "T. Okafor", risk: "medium" as const },
  { id: "UW-1044", applicant: "M. Lindqvist", risk: "high" as const },
];

const tones = { low: "ok", medium: "info", high: "warn" } as const;

export function QueuePage() {
  return (
    <div>
      <PageHeader title="Underwriting Queue" subtitle="Owned by Team Underwriting" />
      <Stack>
        {CASES.map((c) => (
          <Card key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{c.id}</strong>
                <div style={{ color: "#64748b", font: "13px system-ui" }}>{c.applicant}</div>
              </div>
              <Stack direction="row" gap={8} align="center">
                <Badge tone={tones[c.risk]}>{c.risk}</Badge>
                <Link to={c.id}>Review →</Link>
              </Stack>
            </div>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
