import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";
export default async function EmployeeProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <DashboardShell role="employee"><DashboardView role="employee" view="projects" detailType="project" detailId={projectId} /></DashboardShell>; }
