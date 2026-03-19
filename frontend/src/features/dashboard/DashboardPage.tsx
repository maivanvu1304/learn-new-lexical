import { useNavigate } from "react-router-dom";
import { ImportExportPanel } from "../import-export/ImportExportPanel";
import { DueWorkloadCard } from "./DueWorkloadCard";
import { ProgressWidgets } from "./ProgressWidgets";

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="dashboard-title" className="space-y-4">
      <h1 id="dashboard-title" className="text-2xl font-semibold">
        Dashboard
      </h1>
      <DueWorkloadCard onStartReview={() => navigate("/review")} />
      <ProgressWidgets />
      <ImportExportPanel />
    </section>
  );
}
