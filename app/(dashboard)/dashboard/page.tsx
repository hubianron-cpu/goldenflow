import { DashboardActionBar } from "@/components/dashboard/dashboard-action-bar";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardActionBar />
      <DashboardMetrics />
    </div>
  );
}
