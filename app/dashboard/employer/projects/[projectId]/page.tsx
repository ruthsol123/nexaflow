import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";
export default async function EmployerProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <DashboardShell role="employer"><DashboardView role="employer" view="projects" detailType="project" detailId={projectId} /></DashboardShell>; }
