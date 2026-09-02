import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";
export default async function EmployeeTaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) { const { taskId } = await params; return <DashboardShell role="employee"><DashboardView role="employee" view="tasks" detailType="task" detailId={taskId} /></DashboardShell>; }
