import { Outlet } from "react-router-dom";
import type { RemoteModule } from "@workspace/contracts";
import { QueuePage } from "../pages/QueuePage";
import { CaseReviewPage } from "../pages/CaseReviewPage";
import { ArchivePage } from "../pages/ArchivePage";

function Root() {
  return <Outlet />;
}

const remote: RemoteModule = {
  Root,
  routes: [
    { index: true, element: <QueuePage /> },
    { path: "archive", element: <ArchivePage /> },
    { path: ":id", element: <CaseReviewPage /> },
  ],
  subNav: [
    { label: "Queue", path: "", end: true },
    { label: "Archive", path: "archive" },
  ],
};

export default remote;
