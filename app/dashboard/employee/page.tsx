import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function EmployeeDashboardPage() {
  return <DashboardShell role="employee"><DashboardView role="employee" view="overview" /></DashboardShell>;
}
