import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function EmployerDashboardPage() {
  return <DashboardShell role="employer"><DashboardView role="employer" view="overview" /></DashboardShell>;
}
