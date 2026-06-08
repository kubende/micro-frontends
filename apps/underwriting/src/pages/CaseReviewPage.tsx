import { Card, PageHeader, Button, Stack } from "@workspace/design-system";
import { Link, useParams } from "react-router-dom";

export function CaseReviewPage() {
  const { id } = useParams();
  return (
    <div>
      <PageHeader
        title={`Case ${id}`}
        subtitle="Underwriting review"
        actions={
          <Stack direction="row" gap={8}>
            <Button variant="secondary">Decline</Button>
            <Button>Approve</Button>
          </Stack>
        }
      />
      <Card>
        <p style={{ margin: "0 0 8px" }}>
          This page lives in the <strong>underwriting</strong> remote. The shell
          never compiled this file — it loaded it over the network at runtime.
        </p>
        <Link to="..">← Back to queue</Link>
      </Card>
    </div>
  );
}
