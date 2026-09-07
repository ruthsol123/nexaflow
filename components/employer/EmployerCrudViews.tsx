"use client";

import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { useDemoData, employees } from "@/lib/demo-data/DemoDataProvider";
import {
  Priority,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
  Team,
  ChecklistItem,
} from "@/lib/demo-data/workspace";
import { StatusBadge } from "@/components/dashboard/DashboardPrimitives";

const card = "border border-[#10213b]/10 bg-white p-5";
const input =
  "mt-1 w-full rounded-lg border border-[#10213b]/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15";
const statuses: TaskStatus[] = ["To Do", "In Progress", "Review", "Done"];
const projectStatuses: ProjectStatus[] = [
  "Planning",
  "Active",
  "On Hold",
  "Completed",
];
const priorities: Priority[] = ["Low", "Medium", "High"];

function Progress({ value }: { value: number }) {
  return (
    <div className="mt-3 h-1.5 rounded-full bg-slate-100">
      <div
        className="h-1.5 rounded-full bg-[#4bb7c8]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Header({
  eyebrow,
  subtitle,
  action,
}: {
  eyebrow: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-[#198ca4]">
          {eyebrow}
        </p>
        <h1 className="display-font text-4xl tracking-tight text-[#10213b] sm:text-5xl">
          {eyebrow}
        </h1>
        <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Button({
  children,
  onClick,
  secondary = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${secondary ? "border border-[#10213b]/15 text-[#10213b] hover:bg-slate-50" : "bg-[#10213b] text-white hover:bg-[#1c3557]"}`}
    >
      {children}
    </button>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#10213b]/10 bg-white p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
          <h2
            id="dialog-title"
            className="text-lg font-semibold text-[#10213b] sm:text-xl"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-2xl text-slate-400"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ConfirmDialog({
  name,
  warning,
  onCancel,
  onConfirm,
}: {
  name: string;
  warning?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={`Delete this ${name}?`} onClose={onCancel}>
      <p className="text-sm leading-6 text-slate-500">
        This action will remove the {name} from the workspace.
      </p>
      {warning && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {warning}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button secondary onClick={onCancel}>
          Cancel
        </Button>
        <button
          className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
          onClick={onConfirm}
        >
          Delete {name[0].toUpperCase() + name.slice(1)}
        </button>
      </div>
    </Modal>
  );
}
function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      {children}
      {error && (
        <span className="mt-1 block text-xs font-normal text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}
function Toast({ message }: { message: string }) {
  return (
    <p
      className="fixed bottom-5 right-5 z-50 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-medium text-white shadow-lg"
      role="status"
    >
      {message}
    </p>
  );
}

export function EmployerProjectsView() {
  const {
    projects,
    tasks,
    createProject,
    updateProject,
    deleteProject,
    teams,
  } = useDemoData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | ProjectStatus>("All");
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [toast, setToast] = useState("");
  const visible = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" || project.status === filter),
  );
  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }
  function save(project: Omit<Project, "id">, id?: string) {
    if (id) updateProject(id, project);
    else createProject(project);
    setEditing(null);
    notify(
      id ? "Project updated successfully." : "Project created successfully.",
    );
  }
  return (
    <>
      <Header
        eyebrow="Projects"
        subtitle="Create, organize, and deliver company projects."
        action={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                name: "",
                description: "",
                status: "Planning",
                progress: 0,
                startDate: "",
                deadline: "",
                managerId: employees[0].id,
                teamId: teams[0]?.id ?? "",
                memberIds: [],
              })
            }
          >
            + New Project
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          className={`${input} mt-0 max-w-xs`}
          placeholder="Search projects"
          aria-label="Search projects"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {["All", ...projectStatuses].map((item) => (
          <button
            className={`rounded-lg px-3 py-2 text-xs ${filter === item ? "bg-[#10213b] text-white" : "border border-[#10213b]/15"}`}
            onClick={() => setFilter(item as "All" | ProjectStatus)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((project) => (
          <div key={project.id} className="relative">
            <Link
              href={`/dashboard/employer/projects/${project.id}`}
              className={`${card} transition hover:border-cyan-400 block`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{project.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {project.description}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <Progress value={project.progress} />
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                <span>Due {project.deadline}</span>
                <span>
                  {tasks.filter((task) => task.projectId === project.id).length}{" "}
                  tasks
                </span>
                <span>
                  Manager{" "}
                  {
                    employees.find((person) => person.id === project.managerId)
                      ?.name
                  }
                </span>
                <span>{project.memberIds.length} members</span>
              </div>
            </Link>
            <div className="absolute top-4 right-4">
              <details className="relative">
                <summary
                  className="cursor-pointer list-none rounded p-1 text-xl text-slate-400 hover:text-slate-600"
                  aria-label={`Actions for ${project.name}`}
                  onClick={(e) => e.preventDefault()}
                >
                  ⋯
                </summary>
                <div className="absolute right-0 z-10 mt-1 w-28 rounded-lg border bg-white p-1 shadow-lg">
                  <button
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-slate-50"
                    onClick={() => setEditing(project)}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-slate-50"
                    onClick={() => setDeleting(project)}
                  >
                    Delete
                  </button>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <ProjectForm
          project={editing.id ? editing : undefined}
          teams={teams}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <ConfirmDialog
          name="project"
          warning={
            tasks.some((task) => task.projectId === deleting.id)
              ? "This project contains tasks. They will also be removed."
              : undefined
          }
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteProject(deleting.id);
            setDeleting(null);
            notify("Project deleted successfully.");
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </>
  );
}

function ProjectForm({
  project,
  teams,
  onCancel,
  onSave,
}: {
  project?: Project;
  teams: Team[];
  onCancel: () => void;
  onSave: (project: Omit<Project, "id">, id?: string) => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startDate = String(form.get("startDate"));
    const deadline = String(form.get("deadline"));
    if (
      !String(form.get("name")).trim() ||
      !String(form.get("description")).trim() ||
      !deadline
    )
      return setError("Project name, description, and deadline are required.");
    if (startDate && deadline < startDate)
      return setError("Deadline cannot be before the start date.");
    const teamId = String(form.get("teamId"));
    onSave(
      {
        name: String(form.get("name")),
        description: String(form.get("description")),
        status: String(form.get("status")) as ProjectStatus,
        progress: project?.progress ?? 0,
        startDate,
        deadline,
        managerId: String(form.get("managerId")),
        teamId,
        memberIds: teams.find((team) => team.id === teamId)?.memberIds ?? [],
      },
      project?.id,
    );
  }
  return (
    <Modal title={project ? "Edit project" : "New project"} onClose={onCancel}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Project name" error={error}>
          <input
            className={input}
            name="name"
            defaultValue={project?.name}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${input} min-h-24`}
            name="description"
            defaultValue={project?.description}
            required
          />
        </Field>
        <Field label="Status">
          <select
            className={input}
            name="status"
            defaultValue={project?.status}
          >
            {projectStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>
        <Field label="Project manager">
          <select
            className={input}
            name="managerId"
            defaultValue={project?.managerId}
          >
            {employees.map((employee) => (
              <option value={employee.id} key={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Start date">
          <input
            className={input}
            name="startDate"
            type="date"
            defaultValue={project?.startDate}
          />
        </Field>
        <Field label="Deadline">
          <input
            className={input}
            name="deadline"
            type="date"
            defaultValue={project?.deadline}
            required
          />
        </Field>
        <Field label="Team">
          <select
            className={input}
            name="teamId"
            defaultValue={project?.teamId}
          >
            {teams.map((team) => (
              <option value={team.id} key={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button secondary onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save project</Button>
        </div>
      </form>
    </Modal>
  );
}

export function EmployerTasksView() {
  const { tasks, projects, createTask, updateTask, deleteTask } = useDemoData();
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }
  const visible = tasks.filter((task) =>
    task.title.toLowerCase().includes(query.toLowerCase()),
  );
  function save(task: Omit<Task, "id">, id?: string) {
    id ? updateTask(id, task) : createTask(task);
    setEditing(null);
    notify(id ? "Task updated successfully." : "Task assigned successfully.");
  }
  return (
    <>
      <Header
        eyebrow="Tasks"
        subtitle="Assign and track work across the organization."
        action={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                title: "",
                description: "",
                projectId: projects[0]?.id ?? "",
                assigneeId: employees[0].id,
                priority: "Medium",
                status: "To Do",
                dueDate: "",
                checklist: [],
              })
            }
          >
            + New Task
          </Button>
        }
      />
      <input
        className={`${input} mb-5 mt-0 max-w-xs`}
        placeholder="Search tasks"
        aria-label="Search tasks"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="overflow-hidden border border-[#10213b]/10 bg-white">
        {visible.map((task) => (
          <div
            className="grid gap-3 border-b border-[#10213b]/8 px-5 py-4 last:border-0 md:grid-cols-[1.4fr_1fr_.7fr_.8fr_auto] md:items-center"
            key={task.id}
          >
            <div>
              <Link
                className="font-medium hover:text-cyan-700"
                href={`/dashboard/employer/tasks/${task.id}`}
              >
                {task.title}
              </Link>
              <p className="mt-1 text-xs text-slate-500">{task.description}</p>
            </div>
            <span className="text-xs text-slate-500">
              {projects.find((project) => project.id === task.projectId)?.name}{" "}
              ·{" "}
              {
                employees.find((employee) => employee.id === task.assigneeId)
                  ?.name
              }
            </span>
            <StatusBadge status={task.priority} />
            <select
              className="rounded border border-[#10213b]/10 bg-transparent px-2 py-1 text-xs"
              value={task.status}
              onChange={(event) =>
                updateTask(task.id, {
                  status: event.target.value as TaskStatus,
                })
              }
              aria-label={`Status for ${task.title}`}
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button secondary onClick={() => setEditing(task)}>
                Edit
              </Button>
              <button
                className="text-xs text-rose-600"
                onClick={() => setDeleting(task)}
              >
                Delete
              </button>
            </div>
            <span className="text-xs text-slate-500">Due {task.dueDate}</span>
          </div>
        ))}
      </div>
      {editing && (
        <TaskForm
          task={editing.id ? editing : undefined}
          projects={projects}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <ConfirmDialog
          name="task"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteTask(deleting.id);
            setDeleting(null);
            notify("Task deleted successfully.");
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </>
  );
}

function TaskForm({
  task,
  projects,
  onCancel,
  onSave,
}: {
  task?: Task;
  projects: Project[];
  onCancel: () => void;
  onSave: (task: Omit<Task, "id">, id?: string) => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (
      !String(form.get("title")).trim() ||
      !String(form.get("description")).trim() ||
      !String(form.get("dueDate"))
    )
      return setError("Title, description, and due date are required.");
    onSave(
      {
        title: String(form.get("title")),
        description: String(form.get("description")),
        projectId: String(form.get("projectId")),
        assigneeId: String(form.get("assigneeId")),
        priority: String(form.get("priority")) as Priority,
        status: String(form.get("status")) as TaskStatus,
        dueDate: String(form.get("dueDate")),
        checklist: task?.checklist ?? [],
      },
      task?.id,
    );
  }
  return (
    <Modal title={task ? "Edit task" : "New task"} onClose={onCancel}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Task title" error={error}>
          <input
            className={input}
            name="title"
            defaultValue={task?.title}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${input} min-h-24`}
            name="description"
            defaultValue={task?.description}
            required
          />
        </Field>
        <Field label="Project">
          <select
            className={input}
            name="projectId"
            defaultValue={task?.projectId}
          >
            {projects.map((project) => (
              <option value={project.id} key={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assign to">
          <select
            className={input}
            name="assigneeId"
            defaultValue={task?.assigneeId}
          >
            {employees.map((employee) => (
              <option value={employee.id} key={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select
            className={input}
            name="priority"
            defaultValue={task?.priority}
          >
            {priorities.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className={input} name="status" defaultValue={task?.status}>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>
        <Field label="Due date">
          <input
            className={input}
            name="dueDate"
            type="date"
            defaultValue={task?.dueDate}
            required
          />
        </Field>
        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button secondary onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save task</Button>
        </div>
      </form>
    </Modal>
  );
}

export function EmployerTeamsView() {
  const { teams, employees, createTeam, updateTeam, deleteTeam, projects } = useDemoData();
  const [editing, setEditing] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState<Team | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }
  function save(team: Omit<Team, "id">, id?: string) {
    id ? updateTeam(id, team) : createTeam(team);
    setEditing(null);
    notify(id ? "Team updated successfully." : "Team created successfully.");
  }
  return (
    <>
      <Header
        eyebrow="Teams"
        subtitle="Build focused groups around your company work."
        action={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                name: "",
                description: "",
                leadId: employees[0].id,
                memberIds: [employees[0].id],
                projectIds: [],
              })
            }
          >
            + New Team
          </Button>
        }
      />
      <input
        className={`${input} mb-5 mt-0 max-w-xs`}
        placeholder="Search teams"
        aria-label="Search teams"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {teams
          .filter((team) =>
            team.name.toLowerCase().includes(query.toLowerCase()),
          )
          .map((team) => (
            <Link className={`${card} block transition hover:border-cyan-400`} href={`/dashboard/employer/teams/${team.id}`} key={team.id}>
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{team.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {team.description}
                  </p>
                </div>
                <details className="relative">
                  <summary className="cursor-pointer list-none text-xl text-slate-400">
                    ⋯
                  </summary>
                  <div className="absolute right-0 z-10 mt-1 w-24 rounded-lg border bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-xs"
                      onClick={(event) => { event.preventDefault(); setEditing(team); }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-xs text-rose-600"
                      onClick={(event) => { event.preventDefault(); setDeleting(team); }}
                    >
                      Delete
                    </button>
                  </div>
                </details>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Lead:{" "}
                {
                  employees.find((employee) => employee.id === team.leadId)
                    ?.name
                }{" "}
                · {team.memberIds.length} members
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {team.projectIds.length} projects ·{" "}
                {Math.round(
                  team.projectIds.reduce(
                    (sum, id) =>
                      sum +
                      (projects.find((project) => project.id === id)
                        ?.progress ?? 0),
                    0,
                  ) / Math.max(team.projectIds.length, 1),
                )}
                % average progress
              </p>
            </Link>
          ))}
      </div>
      {editing && (
        <TeamForm
          team={editing.id ? editing : undefined}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <ConfirmDialog
          name="team"
          warning={
            projects.some((project) => project.teamId === deleting.id)
              ? "Projects use this team. They will be detached from the deleted team."
              : undefined
          }
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteTeam(deleting.id);
            setDeleting(null);
            notify("Team deleted successfully.");
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </>
  );
}

function TeamForm({
  team,
  onCancel,
  onSave,
}: {
  team?: Team;
  onCancel: () => void;
  onSave: (team: Omit<Team, "id">, id?: string) => void;
}) {
  const { employees: availableEmployees } = useDemoData();
  const [error, setError] = useState("");
  const [members, setMembers] = useState(() =>
    (team?.memberIds ?? []).map((employeeId) => ({
      employeeId,
      role: team?.memberRoles?.[employeeId] ?? availableEmployees.find((employee) => employee.id === employeeId)?.title ?? "",
    })),
  );
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const roleOptions = [
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "UI/UX Designer",
    "Team Lead",
    "Project Manager",
    "QA Engineer",
    "DevOps Engineer",
    "Product Manager",
  ];

  function resetMemberEditor() {
    setEmployeeId("");
    setRole("");
    setCustomRole("");
    setEditingEmployeeId(null);
  }

  function addOrUpdateMember() {
    const selectedRole = role === "Custom Role" ? customRole.trim() : role;
    if (!employeeId) return setError("Select an employee before adding a member.");
    if (!selectedRole) return setError("Select a role or enter a custom role.");
    if (members.some((member) => member.employeeId === employeeId && member.employeeId !== editingEmployeeId)) {
      return setError("That employee is already on this team.");
    }
    setMembers((current) => editingEmployeeId
      ? current.map((member) => member.employeeId === editingEmployeeId ? { employeeId, role: selectedRole } : member)
      : [...current, { employeeId, role: selectedRole }]);
    setError("");
    resetMemberEditor();
  }

  function editMember(member: { employeeId: string; role: string }) {
    setEmployeeId(member.employeeId);
    setRole(roleOptions.includes(member.role) ? member.role : "Custom Role");
    setCustomRole(roleOptions.includes(member.role) ? "" : member.role);
    setEditingEmployeeId(member.employeeId);
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const memberIds = members.map((member) => member.employeeId);
    if (!String(form.get("name")).trim() || !memberIds.length)
      return setError("Team name and at least one member are required.");
    onSave(
      {
        name: String(form.get("name")),
        description: String(form.get("description")),
        leadId: String(form.get("leadId")),
        memberIds,
        projectIds: team?.projectIds ?? [],
        memberRoles: Object.fromEntries(members.map((member) => [member.employeeId, member.role])),
      },
      team?.id,
    );
  }
  return (
    <Modal title={team ? "Edit team" : "New team"} onClose={onCancel}>
      <form className="grid gap-4" onSubmit={submit}>
        <Field label="Team name" error={error}>
          <input
            className={input}
            name="name"
            defaultValue={team?.name}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${input} min-h-24`}
            name="description"
            defaultValue={team?.description}
            required
          />
        </Field>
        <Field label="Team lead">
          <select className={input} name="leadId" defaultValue={team?.leadId}>
            {employees.map((employee) => (
              <option value={employee.id} key={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Members" error={error}>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <select className={input} value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} aria-label="Select employee">
                <option value="">Select employee</option>
                {availableEmployees.filter((employee) => !members.some((member) => member.employeeId === employee.id) || employee.id === editingEmployeeId).map((employee) => (
                  <option value={employee.id} key={employee.id}>{employee.name}</option>
                ))}
              </select>
              <select className={input} value={role} onChange={(event) => setRole(event.target.value)} aria-label="Select role">
                <option value="">Select role</option>
                {roleOptions.map((option) => <option key={option}>{option}</option>)}
                <option>Custom Role</option>
              </select>
            </div>
            {role === "Custom Role" && <input className={input} value={customRole} onChange={(event) => setCustomRole(event.target.value)} placeholder="Enter custom role" aria-label="Custom role" />}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={addOrUpdateMember}>{editingEmployeeId ? "Update Member" : "+ Add Member"}</Button>
              {editingEmployeeId && <Button type="button" secondary onClick={resetMemberEditor}>Cancel edit</Button>}
            </div>
            <div className="space-y-2">
              {members.map((member) => {
                const employee = availableEmployees.find((candidate) => candidate.id === member.employeeId);
                return employee ? <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#10213b]/10 px-3 py-2" key={member.employeeId}>
                  <div><p className="text-sm font-medium">{employee.name}</p><p className="text-xs text-slate-500">{member.role}</p></div>
                  <div className="flex gap-3 text-xs font-medium"><button type="button" className="text-cyan-700 hover:underline" onClick={() => editMember(member)}>Edit</button><button type="button" className="text-rose-600 hover:underline" onClick={() => { setMembers((current) => current.filter((item) => item.employeeId !== member.employeeId)); if (editingEmployeeId === member.employeeId) resetMemberEditor(); }}>Remove</button></div>
                </div> : null;
              })}
            </div>
          </div>
        </Field>
        <div className="flex justify-end gap-3">
          <Button secondary onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save team</Button>
        </div>
      </form>
    </Modal>
  );
}
