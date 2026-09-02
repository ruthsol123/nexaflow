"use client";

import { ReactNode, startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, X, Layers3, Moon, Sun } from "lucide-react";
import { clearDemoSession, getDemoSession, DemoRole, DemoSession } from "@/lib/auth/demo-auth";
import { useTheme } from "@/components/ThemeProvider";

type DashboardShellProps = {
  role: DemoRole;
  children: ReactNode;
};

const employerNav = ["Overview", "Projects", "Tasks", "Employees", "Teams", "Analytics", "Settings"];
const employeeNav = ["Overview", "My Tasks", "My Projects", "Team", "Notifications", "Settings"];

export function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  useEffect(() => {
    const currentSession = getDemoSession();
    if (!currentSession || currentSession.role !== role) {
      router.replace("/login");
      return;
    }
    startTransition(() => setSession(currentSession));
  }, [role, router]);

  function logout() {
    clearDemoSession();
    router.replace("/login");
  }

  if (!session) return <div className="theme-dashboard flex min-h-screen items-center justify-center bg-[#f5f7fa] text-sm text-slate-500">Loading workspace...</div>;

  const navigation = role === "employer" ? employerNav : employeeNav;
  const basePath = role === "employer" ? "/dashboard/employer" : "/dashboard/employee";
  const navigationPaths = role === "employer" ? ["", "/projects", "/tasks", "/employees", "/teams", "/analytics", "/settings"] : ["", "/tasks", "/projects", "/team", "/notifications", "/settings"];
  return <div className="theme-dashboard min-h-screen bg-[#f5f7fa] text-[#10213b]">
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-[#10213b]/10 bg-[#10213b] px-5 py-6 text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between"><Link href={role === "employer" ? "/dashboard/employer" : "/dashboard/employee"} className="flex items-center gap-2.5 font-semibold"><span className="flex size-8 items-center justify-center rounded bg-cyan-300 text-[#07101d]"><Layers3 size={17} /></span>NexaFlow</Link><button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <p className="mt-10 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500 sm:mt-12">{role === "employer" ? "Organization" : "Workspace"}</p>
      <nav className="mt-3 space-y-1 sm:mt-4" aria-label="Dashboard navigation">{navigation.map((item, index) => <Link href={`${basePath}${navigationPaths[index]}`} onClick={() => setMobileOpen(false)} className={`block rounded px-3 py-2.5 text-sm transition ${index === 0 ? "bg-white/10 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-white"}`} key={item}>{item}</Link>)}</nav>
      <div className="absolute bottom-6 left-5 right-5 border-t border-white/10 pt-5"><button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-400 transition hover:text-white" onClick={logout}><LogOut size={15} /> Log out</button></div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-20 bg-[#07111f]/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
    <div className="lg:pl-64"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#10213b]/10 bg-[#f5f7fa]/90 px-4 backdrop-blur sm:px-5 lg:px-8"><button className="text-[#10213b] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button><div className="hidden text-sm text-slate-500 sm:block">{role === "employer" ? "Organization overview" : "My workspace"}</div><div className="ml-auto flex items-center gap-3 sm:gap-4"><button aria-label={themeLabel} title={themeLabel} className="text-slate-500" onClick={toggleTheme}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button><button aria-label="Notifications" className="text-slate-500"><Bell size={18} /></button><div className="flex items-center gap-2 border-l border-[#10213b]/10 pl-3 text-sm sm:pl-4"><span className="flex size-8 items-center justify-center rounded-full bg-[#bfd8df] text-xs font-semibold text-[#10213b]">{session.displayName.slice(0, 2).toUpperCase()}</span><span className="hidden sm:block">{session.displayName}</span><ChevronDown size={14} className="text-slate-400" /></div></div></header><main className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 lg:px-8">{children}</main></div>
  </div>;
}
