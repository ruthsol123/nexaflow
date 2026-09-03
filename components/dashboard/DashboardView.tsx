"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { useDemoData } from "@/lib/demo-data/DemoDataProvider";
import { Priority, ProjectStatus, TaskStatus, Task, employees } from "@/lib/demo-data/workspace";
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
  if (view === "notifications") return <NotificationsView employeeId={employee.email} />;
  return <SettingsView role={role} />;
}

function Header({ eyebrow, subtitle }: { eyebrow: string; subtitle: string }) { const heading = eyebrow === "Organization" ? "Good morning, Sarah" : eyebrow === "Your workspace" ? "Good morning, Alex" : eyebrow; return <div className="mb-6 sm:mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-[#198ca4]">{eyebrow}</p><h1 className="display-font text-3xl tracking-tight text-[#10213b] sm:text-4xl lg:text-5xl">{heading}</h1><p className="mt-2 text-sm text-slate-500 sm:mt-3">{subtitle}</p></div>; }
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
  const { projects, updateTask } = useDemoData(); 
  const [query, setQuery] = useState(""); 
  const [status, setStatus] = useState("All"); 
  const [priority, setPriority] = useState("All"); 
  const filtered = tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()) && (status === "All" || task.status === status) && (priority === "All" || task.priority === priority)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)); 
  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === "Done" ? "To Do" : "Done";
    updateTask(task.id, { status: newStatus });
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
  const { tasks, projects } = useDemoData(); 
  const [query, setQuery] = useState(""); 
  const filtered = employees.filter((employee) => employee.name.toLowerCase().includes(query.toLowerCase()) || employee.department.toLowerCase().includes(query.toLowerCase())); 
  return (
    <>
      <Header 
        eyebrow="Employees" 
        subtitle="Shared visibility across your organization." 
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
    </>
  );
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
  const { projects, tasks, teams, updateTask, updateChecklistItem, activity } = useDemoData(); 
  const project = projects.find((item) => item.id === id); 
  const task = tasks.find((item) => item.id === id); 
  const employee = employees.find((item) => item.id === id); 
  const team = teams.find((item) => item.id === id); 
  if (type === "team" && team) return (
    <>
      <div className="mb-4">
        <Link 
          className="inline-flex items-center text-sm text-cyan-700 hover:underline" 
          href={`${role === "employer" ? "/dashboard/employer" : "/dashboard/employee"}/team`}
        >
          ← {role === "employer" ? "Back to Teams" : "Back to My Team"}
        </Link>
      </div>
      <Header 
        eyebrow="Team detail" 
        subtitle={`${team.name} · led by ${employees.find((person) => person.id === team.leadId)?.name}`} 
      />
      <section className={card}>
        <h2 className="text-2xl font-semibold">{team.name}</h2>
        <h3 className="mt-8 text-sm font-semibold">Members</h3>
        <p className="mt-3 text-sm text-slate-500">{team.memberIds.map((memberId) => employees.find((person) => person.id === memberId)?.name).join(" · ")}</p>
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
  if (type === "project" && project) return (
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
            <p className="mt-2 text-sm text-slate-500">Due {project.deadline} · Managed by {employees.find((person) => person.id === project.managerId)?.name}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <Progress value={project.progress} />
        <p className="mt-2 text-xs text-slate-500">{project.progress}% complete</p>
        <h3 className="mt-8 text-sm font-semibold">Tasks</h3>
        <div className="mt-3 space-y-2">
          {tasks.filter((task) => task.projectId === project.id).map((task) => (
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
                <span>{task.title}</span>
              </div>
              <StatusBadge status={task.priority} />
            </div>
          ))}
        </div>
      </section>
    </>
  ); 
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