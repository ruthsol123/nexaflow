import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";
export default async function EmployerTaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) { const { taskId } = await params; return <DashboardShell role="employer"><DashboardView role="employer" view="tasks" detailType="task" detailId={taskId} /></DashboardShell>; }
