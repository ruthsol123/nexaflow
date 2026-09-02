import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardView } from "@/components/dashboard/DashboardView";
export default async function EmployerEmployeeDetailPage({ params }: { params: Promise<{ employeeId: string }> }) { const { employeeId } = await params; return <DashboardShell role="employer"><DashboardView role="employer" view="employees" detailType="employee" detailId={employeeId} /></DashboardShell>; }
