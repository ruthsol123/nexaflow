"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { useDemoData } from "@/lib/demo-data/DemoDataProvider";
import { Employee, Priority, ProjectStatus, TaskStatus, Task, employees } from "@/lib/demo-data/workspace";
import { StatusBadge, TaskIcon } from "@/components/dashboard/DashboardPrimitives";
import { EmployerProjectsView, EmployerTasksView, EmployerTeamsView } from "@/components/employer/EmployerCrudViews";

type View = "overview" | "projects" | "tasks" | "employees" | "teams" | "analytics" | "settings" | "team" | "notifications";
type Props = { role: "employer" | "employee"; view: View; detailType?: "project" | "task" | "employee" | "team"; detailId?: string };
const card = "border border-[#10213b]/10 bg-white p-5";
const input = "rounded-lg border border-[#10213b]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15";
const statuses: TaskStatus[] = ["To Do", "In Progress", "Review", "Done"];

export function DashboardView({ role, view, detailType, detailId }: Props) {
  const data = useDemoData();
  const employee = employees.find((item) => item.email === "employee@nexaflow.demo")!;
  const scopedTasks = role === "employee" ? data.tasks.filter((task) => task.assigneeId === employee.id) : data.tasks;
  const scopedProjects = role === "employee" ? data.projects.filter((project) => project.memberIds.includes(employee.id)) : data.projects;
  if (detailType) return <DetailView type={detailType} id={detailId ?? ""} role={role} />;
  if (view === "overview") return <Overview role={role} tasks={scopedTasks} projects={scopedProjects} />;
  if (view === "projects") return role === "employer" ? <EmployerProjectsView /> : <ProjectsView role={role} projects={scopedProjects} tasks={scopedTasks} />;
  if (view === "tasks") return role === "employer" ? <EmployerTasksView /> : <TasksView role={role} tasks={scopedTasks} />;
  if (view === "employees") return <EmployeesView />;
  if (view === "teams" || view === "team") return role === "employer" ? <EmployerTeamsView /> : <TeamsView role={role} />;
  if (view === "analytics") return <AnalyticsView />;
  if (view === "notifications") return <NotificationsView employeeId={role === "employer" ? "employer@nexaflow.demo" : employee.email} />;
  return <SettingsView role={role} />;
}

function Header({ eyebrow, subtitle, action }: { eyebrow: string; subtitle: string; action?: ReactNode }) { const heading = eyebrow === "Organization" ? "Good morning, Sarah" : eyebrow === "Your workspace" ? "Good morning, Alex" : eyebrow; return <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-[#198ca4]">{eyebrow}</p><h1 className="display-font text-3xl tracking-tight text-[#10213b] sm:text-4xl lg:text-5xl">{heading}</h1><p className="mt-2 text-sm text-slate-500 sm:mt-3">{subtitle}</p></div>{action}</div>; }
function StatCards({ items }: { items: [string, number][] }) { return <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{items.map(([label, value]) => <div className={card} key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-[#10213b] sm:mt-3 sm:text-2xl">{value}</p></div>)}</div>; }
function Progress({ value }: { value: number }) { return <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#4bb7c8]" style={{ width: `${value}%` }} /></div>; }

function Overview({ role, tasks, projects }: { role: string; tasks: ReturnType<typeof useDemoData>["tasks"]; projects: ReturnType<typeof useDemoData>["projects"] }) { 
  const done = tasks.filter((task) => task.status === "Done").length; 
  const inProgress = tasks.filter((task) => task.status === "In Progress").length; 
  return (
    <>
      <Header 
        eyebrow={role === "employer" ? "Organization" : "Your workspace"} 
        subtitle={role === "employer" ? "Here's what's happening across your organization." : "Here's what you need to focus on today."} 
      />
      <StatCards 
        items={role === "employer" 
          ? [["Active Projects", projects.filter((project) => project.status === "Active").length], ["Team Members", employees.length], ["Tasks In Progress", inProgress], ["Completed Tasks", done]] 
          : [["My Tasks", tasks.length], ["In Progress", inProgress], ["Completed", done], ["Overdue", tasks.filter((task) => task.status !== "Done" && task.dueDate < "2026-08-23").length]]
        } 
      />
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1.3fr_.8fr]">
        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{role === "employer" ? "Project progress" : "My projects"}</h2>
            <Link className="text-xs text-cyan-700" href={role === "employer" ? "/dashboard/employer/projects" : "/dashboard/employee/projects"}>View all</Link>
          </div>
          {projects.length === 0 ? (
            <div className="mt-5 text-center text-slate-500">No projects yet. Create your first project to get started.</div>
          ) : (
            <div className="mt-5 space-y-5">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{project.name}</span>
                    <span className="text-xs text-slate-500">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
              ))}
            </div>
          )}
        </section>
        <section className={card}>
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <div className="mt-5 space-y-4 text-xs text-slate-500">
            {useDemoData().activity.map((item) => (
              <p key={item.id}>
                <b className="text-[#10213b]">{employees.find((person) => person.id === item.actorId)?.name}</b> {item.message} 
                <span className="block mt-1 text-slate-400">{item.createdAt}</span>
              </p>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function ProjectsView({ role, projects, tasks }: { role: string; projects: ReturnType<typeof useDemoData>["projects"]; tasks: ReturnType<typeof useDemoData>["tasks"] }) { 
  const [filter, setFilter] = useState<"All" | ProjectStatus>("All"); 
  const filtered = filter === "All" ? projects : projects.filter((project) => project.status === filter); 
  return (
    <>
      <Header 
        eyebrow={role === "employer" ? "Projects" : "My projects"} 
        subtitle="Track progress, ownership, and delivery timelines." 
      />
      <div className="mb-4 flex flex-wrap gap-2 sm:mb-5">
        {["All", "Active", "Completed", "On Hold"].map((item) => (
          <button 
            className={`rounded-lg px-3 py-2 text-xs font-medium ${filter === item ? "bg-[#10213b] text-white" : "border border-[#10213b]/15"}`} 
            onClick={() => setFilter(item as "All" | ProjectStatus)} 
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className={card}><p className="text-center text-slate-500">No projects found matching the current filter.</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((project) => (
            <Link 
              href={`${role === "employer" ? "/dashboard/employer" : "/dashboard/employee"}/projects/${project.id}`} 
              className={`${card} transition hover:border-cyan-400`} 
              key={project.id}
            >
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold">{project.name}</h2>
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{project.description}</p>
              <Progress value={project.progress} />
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                <span>Due {project.deadline}</span>
                <span>{tasks.filter((task) => task.projectId === project.id).length} tasks</span>
                <span>Manager {employees.find((person) => person.id === project.managerId)?.name}</span>
                <span>{project.memberIds.length} members</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function TasksView({ role, tasks }: { role: string; tasks: ReturnType<typeof useDemoData>["tasks"] }) {
  const { projects, updateTask, createNotification } = useDemoData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const filtered = tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()) && (status === "All" || task.status === status) && (priority === "All" || task.priority === priority)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === "Done" ? "To Do" : "Done";
    const previousStatus = task.status;
    updateTask(task.id, { status: newStatus });

    // Create notification for employer when employee changes task status
    if (role === "employee") {
      const employee = employees.find((e) => e.id === task.assigneeId);
      let message = "";
      const detail = task.title;

      if (newStatus === "Done") {
        message = `${employee?.name || "An employee"} completed '${task.title}'.`;
      } else {
        message = `${employee?.name || "An employee"} moved '${task.title}' from ${previousStatus} to ${newStatus}.`;
      }

      createNotification({
        employeeId: "employer@nexaflow.demo",
        message,
        detail,
        read: false,
        createdAt: "Today"
      });
    }
  };
  return (
    <>
      <Header 
        eyebrow={role === "employer" ? "Tasks" : "My tasks"} 
        subtitle="Search, filter, and update work in the shared workspace." 
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <input 
          className={`${input} min-w-52`} 
          placeholder="Search tasks" 
          aria-label="Search tasks" 
          value={query} 
          onChange={(event) => setQuery(event.target.value)} 
        />
        <select 
          className={input} 
          value={status} 
          onChange={(event) => setStatus(event.target.value)} 
          aria-label="Filter by status"
        >
          <option>All</option>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select 
          className={input} 
          value={priority} 
          onChange={(event) => setPriority(event.target.value)} 
          aria-label="Filter by priority"
        >
          <option>All</option>
          {(["Low", "Medium", "High"] as Priority[]).map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="overflow-hidden border border-[#10213b]/10 bg-white">
        {filtered.map((task) => (
          <div 
            className="grid gap-3 border-b border-[#10213b]/8 px-5 py-4 last:border-0 md:grid-cols-[1.5fr_1fr_.7fr_.8fr_1fr] md:items-center" 
            key={task.id}
          >
            <div className="flex items-center gap-3">
              <button 
                type="button"
                className="cursor-pointer hover:opacity-70" 
                onClick={() => toggleTaskStatus(task)}
                aria-label={task.status === "Done" ? "Mark as incomplete" : "Mark as complete"}
              >
                <TaskIcon status={task.status} />
              </button>
              <Link 
                className="font-medium hover:text-cyan-700" 
                href={`${role === "employer" ? "/dashboard/employer" : "/dashboard/employee"}/tasks/${task.id}`}
              >
                {task.title}
              </Link>
            </div>
            <span className="text-xs text-slate-500">{projects.find((project) => project.id === task.projectId)?.name}</span>
            <StatusBadge status={task.priority} />
            <select 
              className="w-fit rounded border border-[#10213b]/10 bg-transparent px-2 py-1 text-xs" 
              value={task.status} 
              onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })}
            >
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <button className="text-slate-400 hover:text-rose-600" onClick={() => {/* TODO: delete */}}>
              <MoreHorizontal size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function EmployeesView() { 
  const { employees, tasks, projects, createEmployee } = useDemoData(); 
  const [query, setQuery] = useState(""); 
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState("");
  const filtered = employees.filter((employee) => employee.name.toLowerCase().includes(query.toLowerCase()) || employee.title.toLowerCase().includes(query.toLowerCase())); 
  return (
    <>
      <Header 
        eyebrow="Employees" 
        subtitle="Shared visibility across your organization." 
        action={<button className="rounded-lg bg-[#10213b] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1c3557]" onClick={() => setShowCreateForm(true)}>+ Add Employee</button>}
      />
      <input 
        className={`${input} mb-4 w-full max-w-sm sm:mb-5`} 
        placeholder="Search employees" 
        aria-label="Search employees" 
        value={query} 
        onChange={(event) => setQuery(event.target.value)} 
      />
      {filtered.length === 0 ? (
        <div className={card}><p className="text-center text-slate-500">No employees found matching your search.</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((employee) => (
            <Link 
              className={`${card} transition hover:border-cyan-400`} 
              href={`/dashboard/employer/employees/${employee.id}`} 
              key={employee.id}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#bfd8df] text-sm font-semibold text-[#10213b]">
                  {employee.name.split(" ").map((part) => part[0]).join("")}
                </span>
                <div>
                  <h2 className="font-semibold">{employee.name}</h2>
                  <p className="text-xs text-slate-500">{employee.title} · {employee.department}</p>
                </div>
                <span className="ml-auto"><StatusBadge status={employee.status} /></span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-500 sm:mt-5">
                <span>{projects.filter((project) => project.memberIds.includes(employee.id)).length} active projects</span>
                <span>{tasks.filter((task) => task.assigneeId === employee.id && task.status !== "Done").length} assigned tasks</span>
                <span>{tasks.filter((task) => task.assigneeId === employee.id && task.status === "Done").length} completed</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {showCreateForm && <CreateEmployeeForm employees={employees} createEmployee={createEmployee} onCancel={() => setShowCreateForm(false)} onCreated={() => { setShowCreateForm(false); setToast("Employee created successfully."); window.setTimeout(() => setToast(""), 2400); }} />}
      {toast && <p className="fixed bottom-5 right-5 z-50 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-medium text-white shadow-lg" role="status">{toast}</p>}
    </>
  );
}

function CreateEmployeeForm({ employees, createEmployee, onCancel, onCreated }: { employees: Employee[]; createEmployee: (employee: Omit<Employee, "id">, password: string) => Employee; onCancel: () => void; onCreated: () => void }) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const title = String(form.get("title") ?? "").trim();
    if (!name || !email || !password || !confirmPassword || !title) return setError("All fields are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (employees.some((employee) => employee.email.toLowerCase() === email)) return setError("An employee with this email already exists.");
    if (/^\s|\s$/.test(password) || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) return setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    createEmployee({ name, email, title, department: "General", status: "Active", teamId: "" }, password);
    onCreated();
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="create-employee-title"><section className="w-full max-w-lg rounded-xl border border-[#10213b]/10 bg-white p-5 shadow-2xl sm:p-6"><div className="flex items-center justify-between gap-4"><h2 id="create-employee-title" className="text-xl font-semibold text-[#10213b]">Add Employee</h2><button onClick={onCancel} aria-label="Close dialog" className="text-2xl text-slate-400">×</button></div><form className="mt-5 grid gap-4" onSubmit={submit}><label className="text-xs font-medium text-slate-600">Full name<input className={input} name="name" required /></label><label className="text-xs font-medium text-slate-600">Email<input className={input} name="email" type="email" required /></label><label className="text-xs font-medium text-slate-600">Password<input className={input} name="password" type="password" minLength={8} required /></label><label className="text-xs font-medium text-slate-600">Confirm password<input className={input} name="confirmPassword" type="password" minLength={8} required /></label><label className="text-xs font-medium text-slate-600">Role / position<input className={input} name="title" required /></label>{error && <p className="text-sm text-rose-600" role="alert">{error}</p>}<div className="flex justify-end gap-3"><button type="button" className="rounded-lg border border-[#10213b]/15 px-3 py-2 text-sm font-semibold text-[#10213b] hover:bg-slate-50" onClick={onCancel}>Cancel</button><button type="submit" className="rounded-lg bg-[#10213b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1c3557]">Create Employee</button></div></form></section></div>;
}

function TeamsView({ role }: { role: string }) { 
  const { projects, teams } = useDemoData(); 
  const visibleTeams = role === "employee" ? teams.filter((team) => team.memberIds.includes("alex")) : teams; 
  return (
    <>
      <Header 
        eyebrow={role === "employer" ? "Teams" : "My team"} 
        subtitle="People, projects, and progress in one view." 
      />
      {visibleTeams.length === 0 ? (
        <div className={card}>
          <p className="text-center text-slate-500">
            {role === "employer" ? "No teams created yet. Create your first team to get started." : "You're not assigned to any teams yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleTeams.map((team) => (
            <Link 
              href={`${role === "employer" ? "/dashboard/employer" : "/dashboard/employee"}/teams/${team.id}`} 
              className={`${card} transition hover:border-cyan-400`} 
              key={team.id}
            >
              <div className="flex justify-between">
                <h2 className="font-semibold">{team.name}</h2>
                <span className="text-xs text-slate-500">{team.memberIds.length} members</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Lead: {employees.find((person) => person.id === team.leadId)?.name}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {team.memberIds.map((id) => (
                  <span className="rounded bg-[#d7eef2] px-2 py-1 text-xs font-medium text-slate-900 dark:bg-[#183548] dark:text-cyan-100" key={id}>
                    {employees.find((person) => person.id === id)?.name}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {team.projectIds.length} projects · {Math.round(team.projectIds.reduce((sum, id) => sum + (projects.find((project) => project.id === id)?.progress ?? 0), 0) / team.projectIds.length)}% average progress
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function AnalyticsView() { 
  const { tasks, projects } = useDemoData(); 
  const total = tasks.length; 
  const done = tasks.filter((task) => task.status === "Done").length; 
  return (
    <>
      <Header 
        eyebrow="Analytics" 
        subtitle="A live read on the shared demo workspace." 
      />
      <StatCards 
        items={[
          ["Project completion", Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)], 
          ["Task completion", Math.round(done / total * 100)], 
          ["Overdue tasks", tasks.filter((task) => task.status !== "Done" && task.dueDate < "2026-08-23").length], 
          ["Total tasks", total]
        ]} 
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="text-sm font-semibold">Tasks by status</h2>
          <div className="mt-5 space-y-4">
            {statuses.map((status) => { 
              const count = tasks.filter((task) => task.status === status).length; 
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs">
                    <span>{status}</span>
                    <span>{count}</span>
                  </div>
                  <Progress value={count / total * 100} />
                </div>
              );
            })}
          </div>
        </section>
        <section className={card}>
          <h2 className="text-sm font-semibold">Project completion</h2>
          <div className="mt-5 space-y-4">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between text-xs">
                  <span>{project.name}</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function DetailView({ type, id, role }: { type: "project" | "task" | "employee" | "team"; id: string; role: string }) {
  const { projects, tasks, teams, employees, updateTask, updateChecklistItem, updateTeam, deleteTeam } = useDemoData();
  const router = useRouter();
  const project = projects.find((item) => item.id === id);
  const task = tasks.find((item) => item.id === id);
  const employee = employees.find((item) => item.id === id);
  const team = teams.find((item) => item.id === id);
  if (type === "team" && team) {
    const currentTeam = team;
    const memberIds = new Set(currentTeam.memberIds);
    const teamTasks = tasks.filter((item) => memberIds.has(item.assigneeId));
    const completedTasks = teamTasks.filter((item) => item.status === "Done").length;
    const remainingTasks = teamTasks.length - completedTasks;
    const teamActivity = teamTasks.length ? Math.round((completedTasks / teamTasks.length) * 100) : 0;
    const members = currentTeam.memberIds
      .map((memberId) => employees.find((person) => person.id === memberId))
      .filter((person): person is Employee => Boolean(person))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((person) => {
        const assignedTasks = tasks.filter((item) => item.assigneeId === person.id);
        const completed = assignedTasks.filter((item) => item.status === "Done").length;
        return { person, assigned: assignedTasks.length, completed, remaining: assignedTasks.length - completed, activity: assignedTasks.length ? Math.round((completed / assignedTasks.length) * 100) : 0 };
      });
    const availableEmployees = employees.filter((person) => !memberIds.has(person.id));
    const roleOptions = ["Frontend Developer", "Backend Developer", "Team Lead", "Project Manager", "UI/UX Designer", "QA Engineer", "Growth Lead"];

    function addMember(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const employeeId = String(form.get("employeeId") || "");
      const memberRole = String(form.get("memberRole") || "");
      if (!employeeId || !memberRole || memberIds.has(employeeId)) return;
      updateTeam(currentTeam.id, { memberIds: [...currentTeam.memberIds, employeeId], memberRoles: { ...currentTeam.memberRoles, [employeeId]: memberRole } });
      event.currentTarget.reset();
    }

    function removeMember(employeeId: string) {
      const nextRoles = { ...currentTeam.memberRoles };
      delete nextRoles[employeeId];
      updateTeam(currentTeam.id, { memberIds: currentTeam.memberIds.filter((memberId) => memberId !== employeeId), memberRoles: nextRoles });
    }

    function removeTeam() {
      if (!window.confirm(`Delete ${currentTeam.name}? Employees, projects, and tasks will be kept.`)) return;
      deleteTeam(currentTeam.id);
      router.push("/dashboard/employer/teams");
    }

    return (
    <>
      <div className="mb-4">
        <Link 
          className="inline-flex items-center text-sm text-cyan-700 hover:underline" 
          href={`${role === "employer" ? "/dashboard/employer" : "/dashboard/employee"}/${role === "employer" ? "teams" : "team"}`}
        >
          ← {role === "employer" ? "Back to Teams" : "Back to My Team"}
        </Link>
      </div>
      <Header 
        eyebrow="Team detail" 
        subtitle={`${team.name} · led by ${employees.find((person) => person.id === team.leadId)?.name}`}
        action={role === "employer" ? <button className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50" onClick={removeTeam}>Delete Team</button> : undefined}
      />
      <section className={card}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-2xl font-semibold">{team.name}</h2><p className="mt-2 text-sm text-slate-500">{team.description}</p></div>
          <div className="text-right"><p className="text-xs text-slate-500">Team activity</p><p className="mt-1 text-2xl font-semibold">{teamActivity}%</p></div>
        </div>
        <div className="mt-6 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#4bb7c8] transition-all duration-300" style={{ width: `${teamActivity}%` }} /></div>
        <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[#10213b]/10 py-5 sm:grid-cols-4">
          <div><p className="text-xs text-slate-500">Members</p><p className="mt-1 text-xl font-semibold">{members.length}</p></div>
          <div><p className="text-xs text-slate-500">Assigned tasks</p><p className="mt-1 text-xl font-semibold">{teamTasks.length}</p></div>
          <div><p className="text-xs text-slate-500">Completed</p><p className="mt-1 text-xl font-semibold text-emerald-600">{completedTasks}</p></div>
          <div><p className="text-xs text-slate-500">Remaining</p><p className="mt-1 text-xl font-semibold text-amber-600">{remainingTasks}</p></div>
        </div>
        <div className="mt-8 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Team members</h3><span className="text-xs text-slate-500">Sorted alphabetically</span></div>
        <div className="mt-3 space-y-3">
          {members.map(({ person, assigned, completed, remaining, activity }) => (
            <div className="rounded border border-[#10213b]/10 p-4" key={person.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-[#bfd8df] text-sm font-semibold text-[#10213b]">{person.name.split(" ").map((part) => part[0]).join("")}</span><div><p className="font-medium">{person.name}</p><p className="text-xs text-slate-500">{team.memberRoles?.[person.id] || person.title}</p></div></div>
                <div className="flex items-center gap-3"><span className="text-lg font-semibold">{activity}%</span>{role === "employer" && <button className="text-xs font-medium text-rose-600 hover:underline" onClick={() => removeMember(person.id)}>Remove</button>}</div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#4bb7c8] transition-all duration-300" style={{ width: `${activity}%` }} /></div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-500"><span><b className="block text-[#10213b]">{assigned}</b>Assigned</span><span><b className="block text-emerald-600">{completed}</b>Completed</span><span><b className="block text-amber-600">{remaining}</b>Remaining</span></div>
            </div>
          ))}
          {members.length === 0 && <p className="text-sm text-slate-500">No members are assigned to this team yet.</p>}
        </div>
        {role === "employer" && <form className="mt-5 grid gap-3 rounded border border-dashed border-[#10213b]/15 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={addMember}><label className="text-xs font-medium text-slate-600">Employee<select className={input} name="employeeId" required disabled={!availableEmployees.length}><option value="">Select employee</option>{availableEmployees.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label><label className="text-xs font-medium text-slate-600">Team role<select className={input} name="memberRole" required><option value="">Select role</option>{roleOptions.map((option) => <option key={option}>{option}</option>)}</select></label><button className="rounded-lg bg-[#10213b] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!availableEmployees.length}>Add Member</button></form>}
        <h3 className="mt-8 text-sm font-semibold">Projects</h3>
        <div className="mt-3 space-y-2">
          {team.projectIds.map((projectId) => { 
            const item = projects.find((candidate) => candidate.id === projectId); 
            return item ? (
              <Link 
                className="flex justify-between rounded border border-[#10213b]/10 p-3 text-sm" 
                href={`${role === "employer" ? "/dashboard/employer" : "/dashboard/employee"}/projects/${item.id}`} 
                key={item.id}
              >
                <span>{item.name}</span>
                <span className="text-slate-500">{item.progress}%</span>
              </Link>
            ) : null; 
          })}
        </div>
      </section>
    </>
    );
  }
  if (type === "project" && project) {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const completedTasks = projectTasks.filter((task) => task.status === "Done").length;
    const calculatedProgress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
    const participatingEmployees = employees
      .filter((person) => project.memberIds.includes(person.id) || projectTasks.some((item) => item.assigneeId === person.id))
      .map((person) => {
        const assignedTasks = projectTasks.filter((item) => item.assigneeId === person.id);
        const completed = assignedTasks.filter((item) => item.status === "Done").length;
        return { person, assignedTasks, completed, remaining: assignedTasks.length - completed, percentage: assignedTasks.length ? Math.round(completed / assignedTasks.length * 100) : 0 };
      })
      .sort((a, b) => b.percentage - a.percentage || a.person.name.localeCompare(b.person.name));

    return (
    <>
      <div className="mb-4">
        <Link 
          className="inline-flex items-center text-sm text-cyan-700 hover:underline" 
          href={`${role === "employer" ? "/dashboard/employer" : "/dashboard/employee"}/projects`}
        >
          ← {role === "employer" ? "Back to Projects" : "Back to My Projects"}
        </Link>
      </div>
      <Header 
        eyebrow="Project detail" 
        subtitle={project.description} 
      />
      <section className={card}>
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">{project.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="mt-6 grid gap-4 border-y border-[#10213b]/10 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs text-slate-500">Overall progress</p><p className="mt-1 text-2xl font-semibold">{calculatedProgress}%</p><Progress value={calculatedProgress} /></div>
          <div><p className="text-xs text-slate-500">Tasks</p><p className="mt-1 text-2xl font-semibold">{projectTasks.length}</p><p className="text-xs text-slate-500">{completedTasks} completed</p></div>
          <div><p className="text-xs text-slate-500">Project leader</p><p className="mt-1 font-semibold">{employees.find((person) => person.id === project.managerId)?.name ?? "Unassigned"}</p><p className="text-xs text-slate-500">{employees.find((person) => person.id === project.managerId)?.title}</p></div>
          <div><p className="text-xs text-slate-500">Due date</p><p className="mt-1 font-semibold">{project.deadline}</p></div>
        </div>

        <h3 className="mt-8 text-sm font-semibold">Project Participants</h3>
        <div className="mt-3 space-y-4">
          {participatingEmployees.map(({ person, assignedTasks, completed, remaining, percentage }) => (
            <div key={person.id} className="rounded border border-[#10213b]/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#bfd8df] text-sm font-semibold text-[#10213b]">
                    {person.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-xs text-slate-500">{person.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{percentage}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div 
                  className="h-2 rounded-full bg-[#4bb7c8] transition-all duration-300" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-[#10213b]">{assignedTasks.length}</p>
                  <p>Assigned Tasks</p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-600">{completed}</p>
                  <p>Completed</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-600">{remaining}</p>
                  <p>Remaining</p>
                </div>
              </div>
            </div>
          ))}
          {participatingEmployees.length === 0 && (
            <p className="text-sm text-slate-500">No participants assigned to this project yet.</p>
          )}
        </div>
        
        <h3 className="mt-8 text-sm font-semibold">Project Participants</h3>
        <div className="mt-3 space-y-4">
          {participatingEmployees.map(({ person, assignedTasks, completed, remaining, percentage }) => (
            <div key={person.id} className="rounded border border-[#10213b]/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#bfd8df] text-sm font-semibold text-[#10213b]">
                    {person.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-xs text-slate-500">{person.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{percentage}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div 
                  className="h-2 rounded-full bg-[#4bb7c8] transition-all duration-300" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-[#10213b]">{assignedTasks.length}</p>
                  <p>Assigned Tasks</p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-600">{completed}</p>
                  <p>Completed</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-600">{remaining}</p>
                  <p>Remaining</p>
                </div>
              </div>
            </div>
          ))}
          {participatingEmployees.length === 0 && (
            <p className="text-sm text-slate-500">No participants assigned to this project yet.</p>
          )}
        </div>
        
        <h3 className="mt-8 text-sm font-semibold">Project Tasks</h3>
        <div className="mt-3 space-y-2">
          {projectTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded border border-[#10213b]/10 p-3 text-sm">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="cursor-pointer hover:opacity-70" 
                  onClick={() => {
                    const newStatus = task.status === "Done" ? "To Do" : "Done";
                    updateTask(task.id, { status: newStatus });
                  }}
                  aria-label={task.status === "Done" ? "Mark as incomplete" : "Mark as complete"}
                >
                  <TaskIcon status={task.status} />
                </button>
                <div>
                  <span>{task.title}</span>
                  <p className="text-xs text-slate-500">Assigned to {employees.find((e) => e.id === task.assigneeId)?.name} · {employees.find((e) => e.id === task.assigneeId)?.title}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={task.status} />
                <StatusBadge status={task.priority} />
              </div>
            </div>
          ))}
          {projectTasks.length === 0 && (
            <p className="text-sm text-slate-500">No tasks assigned to this project yet.</p>
          )}
        </div>
      </section>
    </>
  );
  }
  if (type === "task" && task) return (
    <>
      <div className="mb-4">
        <Link 
          className="inline-flex items-center text-sm text-cyan-700 hover:underline" 
          href={`${role === "employer" ? "/dashboard/employer" : "/dashboard/employee"}/tasks`}
        >
          ← {role === "employer" ? "Back to Tasks" : "Back to My Tasks"}
        </Link>
      </div>
      <Header 
        eyebrow="Task detail" 
        subtitle={task.description} 
      />
      <section className={card}>
        <div className="flex justify-between gap-3">
          <h2 className="text-2xl font-semibold">{task.title}</h2>
          <StatusBadge status={task.status} />
        </div>
        <p className="mt-2 text-sm text-slate-500">Due {task.dueDate} · Priority: {task.priority}</p>
        <p className="mt-4 text-sm leading-6 text-slate-500">{task.description}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Assigned to</h3>
            <p className="mt-2 text-sm text-slate-500">{employees.find((person) => person.id === task.assigneeId)?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Project</h3>
            <p className="mt-2 text-sm text-slate-500">{projects.find((project) => project.id === task.projectId)?.name}</p>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-sm font-semibold">Checklist</h3>
          <div className="mt-3 space-y-2">
            {(task.checklist || []).map((item) => (
              <label 
                key={item.id} 
                className="flex items-center gap-3 rounded border border-[#10213b]/10 p-3 text-sm hover:bg-slate-50 cursor-pointer"
              >
                <input 
                  type="checkbox" 
                  checked={item.completed} 
                  onChange={(e) => {
                    updateChecklistItem(task.id, item.id, e.target.checked);
                    const allCompleted = (task.checklist || []).every((i) => i.id === item.id ? e.target.checked : i.completed);
                    if (allCompleted && task.status !== "Done") {
                      updateTask(task.id, { status: "Done" });
                    }
                  }}
                  className="h-4 w-4 rounded border-[#10213b]/20 text-cyan-600 focus:ring-cyan-500"
                />
                <span className={item.completed ? "line-through text-slate-400" : ""}>{item.text}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </>
  ); 
  if (type === "employee" && employee) return (
    <>
      <Header 
        eyebrow="Employee detail" 
        subtitle={`${employee.name} · ${employee.title}`} 
      />
      <section className={card}>
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#bfd8df] text-xl font-semibold text-[#10213b]">
            {employee.name.split(" ").map((part) => part[0]).join("")}
          </span>
          <div>
            <h2 className="text-2xl font-semibold">{employee.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{employee.title} · {employee.department}</p>
          </div>
          <span className="ml-auto"><StatusBadge status={employee.status} /></span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Projects</h3>
            <p className="mt-2 text-sm text-slate-500">{projects.filter((project) => project.memberIds.includes(employee.id)).length} active projects</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Tasks</h3>
            <p className="mt-2 text-sm text-slate-500">{tasks.filter((task) => task.assigneeId === employee.id).length} assigned tasks</p>
          </div>
        </div>
      </section>
    </>
  ); 
  return <div className={card}><p className="text-center text-slate-500">Item not found.</p></div>;
}

function NotificationsView({ employeeId }: { employeeId: string }) { 
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDemoData(); 
  const visible = notifications.filter((notification) => notification.employeeId === employeeId); 
  
  // Mark all notifications as read when viewing the page
  useEffect(() => {
    markAllNotificationsRead(employeeId);
  }, [employeeId, markAllNotificationsRead]);
  
  return (
    <>
      <Header 
        eyebrow="Notifications" 
        subtitle="Stay current on the work that needs your attention." 
      />
      <div className="space-y-3">
        {visible.map((notification) => (
          <article 
            className={`${card} ${notification.read ? "opacity-70" : "border-cyan-300"}`} 
            key={notification.id}
          >
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">{notification.message}</h2>
                <p className="mt-2 text-sm text-slate-500">{notification.detail}</p>
                <p className="mt-2 text-xs text-slate-400">{notification.createdAt}</p>
              </div>
              {!notification.read && (
                <button 
                  className="h-fit text-xs text-cyan-700 underline" 
                  onClick={() => markNotificationRead(notification.id)}
                >
                  Mark read
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function SettingsView({ role }: { role: string }) { 
  const [email, setEmail] = useState(true); 
  const [tasks, setTasks] = useState(true); 
  const [projects, setProjects] = useState(true); 
  return (
    <>
      <Header 
        eyebrow="Settings" 
        subtitle="Manage your workspace preferences locally for this demo." 
      />
      <div className="grid max-w-3xl gap-6">
        <section className={card}>
          <h2 className="font-semibold">{role === "employer" ? "Company profile" : "Profile"}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-slate-500">
              {role === "employer" ? "Company name" : "Name"}
              <input className={`${input} mt-2 w-full`} defaultValue={role === "employer" ? "NexaFlow Labs" : "Alex Morgan"} />
            </label>
            <label className="text-xs text-slate-500">
              {role === "employer" ? "Industry" : "Email"}
              <input className={`${input} mt-2 w-full`} defaultValue={role === "employer" ? "Software" : "employee@nexaflow.demo"} />
            </label>
            <label className="text-xs text-slate-500">
              {role === "employer" ? "Website" : "Job title"}
              <input className={`${input} mt-2 w-full`} defaultValue={role === "employer" ? "nexaflow.example" : "Frontend Developer"} />
            </label>
            {role === "employer" && (
              <label className="text-xs text-slate-500">
                Workspace name
                <input className={`${input} mt-2 w-full`} defaultValue="NexaFlow Workspace" />
              </label>
            )}
            {role === "employer" && (
              <label className="text-xs text-slate-500">
                Timezone
                <input className={`${input} mt-2 w-full`} defaultValue="UTC-05:00 Eastern Time" />
              </label>
            )}
          </div>
        </section>
        <section className={card}>
          <h2 className="font-semibold">Notifications & preferences</h2>
          <div className="mt-4 space-y-4">
            {[
              ["Email notifications", email, setEmail], 
              ["Task notifications", tasks, setTasks], 
              [role === "employer" ? "Project notifications" : "Theme follows system", projects, setProjects]
            ].map(([label, value, setter]) => (
              <label className="flex items-center justify-between text-sm" key={label as string}>
                {label as string}
                <input 
                  type="checkbox" 
                  checked={value as boolean} 
                  onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} 
                />
              </label>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}