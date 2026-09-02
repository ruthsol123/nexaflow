import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";
export default async function EmployeeTeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) { const { teamId } = await params; return <DashboardShell role="employee"><DashboardView role="employee" view="team" detailType="team" detailId={teamId} /></DashboardShell>; }
