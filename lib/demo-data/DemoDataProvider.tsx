"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { saveDemoAccount } from "@/lib/auth/demo-auth";
import { activity as initialActivity, Activity, employees as initialEmployees, Employee, notifications as initialNotifications, Notification, projects as initialProjects, Project, tasks as initialTasks, Task, teams as initialTeams, Team } from "@/lib/demo-data/workspace";

type DemoDataContextValue = { employees: Employee[]; projects: Project[]; tasks: Task[]; teams: Team[]; notifications: Notification[]; activity: Activity[]; createEmployee: (employee: Omit<Employee, "id">, password: string) => Employee; createProject: (project: Omit<Project, "id">) => Project; updateProject: (id: string, changes: Partial<Project>) => void; deleteProject: (id: string) => void; createTask: (task: Omit<Task, "id">) => Task; updateTask: (id: string, changes: Partial<Task>) => void; deleteTask: (id: string) => void; updateChecklistItem: (taskId: string, checklistItemId: string, completed: boolean) => void; createTeam: (team: Omit<Team, "id">) => Team; updateTeam: (id: string, changes: Partial<Team>) => void; deleteTeam: (id: string) => void; createNotification: (notification: Omit<Notification, "id">) => Notification; markNotificationRead: (id: string) => void; markAllNotificationsRead: (employeeId: string) => void; getUnreadNotificationCount: (employeeId: string) => number };
const DemoDataContext = createContext<DemoDataContextValue | null>(null);

function readStored<T>(key: string, fallback: T): T { if (typeof window === "undefined") return fallback; const stored = window.localStorage.getItem(key); if (!stored) return fallback; try { return JSON.parse(stored) as T; } catch { return fallback; } }
function makeId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [employeeState, setEmployeeState] = useState(() => readStored("nexaflow-employees", initialEmployees));
  const [taskState, setTaskState] = useState(() => readStored("nexaflow-tasks", initialTasks));
  const [projectState, setProjectState] = useState(() => {
    const stored = readStored("nexaflow-projects", initialProjects);
    return stored.map((project) => ({ ...project, progress: calculateProgress(project.id, taskState) }));
  });
  const [teamState, setTeamState] = useState(() => readStored("nexaflow-teams", initialTeams));
  const [notificationState, setNotificationState] = useState(() => {
    const stored = readStored("nexaflow-notifications", initialNotifications).map((notification) => notification.employeeId === "sarah@nexaflow.demo" ? { ...notification, employeeId: "employer@nexaflow.demo" } : notification);
    const storedIds = new Set(stored.map((notification) => notification.id));
    return [...stored, ...initialNotifications.filter((notification) => !storedIds.has(notification.id))];
  });
  function persist<T>(key: string, items: T[]) { window.localStorage.setItem(key, JSON.stringify(items)); }
  function createEmployee(employee: Omit<Employee, "id">, password: string) { const created = { ...employee, id: makeId("employee") }; setEmployeeState((items) => { const next = [...items, created]; persist("nexaflow-employees", next); return next; }); saveDemoAccount({ email: created.email, password, role: "employee", displayName: created.name }); return created; }
  function createProject(project: Omit<Project, "id">) { const created = { ...project, id: makeId("project") }; setProjectState((items) => { const next = [...items, created]; persist("nexaflow-projects", next); return next; }); return created; }
  function updateProject(id: string, changes: Partial<Project>) { setProjectState((items) => { const next = items.map((project) => project.id === id ? { ...project, ...changes } : project); persist("nexaflow-projects", next); return next; }); }
  function deleteProject(id: string) { setProjectState((items) => { const next = items.filter((project) => project.id !== id); persist("nexaflow-projects", next); return next; }); setTaskState((items) => { const next = items.filter((task) => task.projectId !== id); persist("nexaflow-tasks", next); return next; }); }
  function createTask(task: Omit<Task, "id">) { const created = { ...task, id: makeId("task") }; setTaskState((items) => { const next = [...items, created]; persist("nexaflow-tasks", next); return next; }); return created; }
  function syncProjectProgress(nextTasks: Task[]) { setProjectState((items) => { const next = items.map((project) => ({ ...project, progress: calculateProgress(project.id, nextTasks) })); persist("nexaflow-projects", next); return next; }); }
  function updateTask(id: string, changes: Partial<Task>) {
    const next = taskState.map((task) => {
      if (task.id !== id) return task;
      const updated = { ...task, ...changes };
      if (updated.status === "Done") updated.completedBy = changes.completedBy ?? task.completedBy ?? task.assigneeId;
      else delete updated.completedBy;
      return updated;
    });
    setTaskState(next);
    persist("nexaflow-tasks", next);
    syncProjectProgress(next);
  }
  function updateChecklistItem(taskId: string, checklistItemId: string, completed: boolean) { setTaskState((items) => { const next = items.map((task) => task.id === taskId ? { ...task, checklist: task.checklist.map((item) => item.id === checklistItemId ? { ...item, completed } : item) } : task); persist("nexaflow-tasks", next); return next; }); }
  function deleteTask(id: string) { const next = taskState.filter((task) => task.id !== id); setTaskState(next); persist("nexaflow-tasks", next); syncProjectProgress(next); }
  function createTeam(team: Omit<Team, "id">) { const created = { ...team, id: makeId("team") }; setTeamState((items) => { const next = [...items, created]; persist("nexaflow-teams", next); return next; }); return created; }
  function updateTeam(id: string, changes: Partial<Team>) { setTeamState((items) => { const next = items.map((team) => team.id === id ? { ...team, ...changes } : team); persist("nexaflow-teams", next); return next; }); }
  function deleteTeam(id: string) { setTeamState((items) => { const next = items.filter((team) => team.id !== id); persist("nexaflow-teams", next); return next; }); setProjectState((items) => { const next = items.map((project) => project.teamId === id ? { ...project, teamId: "" } : project); persist("nexaflow-projects", next); return next; }); }
  function markNotificationRead(id: string) { setNotificationState((items) => { const nextItems = items.map((notification) => notification.id === id ? { ...notification, read: true } : notification); window.localStorage.setItem("nexaflow-notifications", JSON.stringify(nextItems)); return nextItems; }); }
  const markAllNotificationsRead = useCallback((employeeId: string) => { setNotificationState((items) => { const nextItems = items.map((notification) => notification.employeeId === employeeId ? { ...notification, read: true } : notification); if (nextItems.some((notification, index) => notification.read !== items[index].read)) window.localStorage.setItem("nexaflow-notifications", JSON.stringify(nextItems)); return nextItems; }); }, []);
  function createNotification(notification: Omit<Notification, "id">) { const created = { ...notification, id: makeId("notification") }; setNotificationState((items) => { const next = [...items, created]; window.localStorage.setItem("nexaflow-notifications", JSON.stringify(next)); return next; }); return created; }
  function getUnreadNotificationCount(employeeId: string) { return notificationState.filter((notification) => notification.employeeId === employeeId && !notification.read).length; }
  return <DemoDataContext.Provider value={{ employees: employeeState, projects: projectState, tasks: taskState, teams: teamState, notifications: notificationState, activity: initialActivity, createEmployee, createProject, updateProject, deleteProject, createTask, updateTask, deleteTask, updateChecklistItem, createTeam, updateTeam, deleteTeam, createNotification, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount }}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() { const context = useContext(DemoDataContext); if (!context) throw new Error("useDemoData must be used within DemoDataProvider"); return context; }
export { initialEmployees as employees };

function calculateProgress(projectId: string, taskItems: Task[]) {
  const projectTasks = taskItems.filter((task) => task.projectId === projectId);
  return projectTasks.length ? Math.round(projectTasks.filter((task) => task.status === "Done").length / projectTasks.length * 100) : 0;
}