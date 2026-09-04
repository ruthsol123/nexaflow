import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function EmployerNotificationsPage() {
  return <DashboardShell role="employer"><DashboardView role="employer" view="notifications" /></DashboardShell>;
}
