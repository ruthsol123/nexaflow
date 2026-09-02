import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";
export default async function EmployerTeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) { const { teamId } = await params; return <DashboardShell role="employer"><DashboardView role="employer" view="teams" detailType="team" detailId={teamId} /></DashboardShell>; }
