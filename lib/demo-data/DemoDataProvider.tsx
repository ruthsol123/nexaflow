"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { activity as initialActivity, Activity, employees, notifications as initialNotifications, Notification, projects as initialProjects, Project, tasks as initialTasks, Task, teams as initialTeams, Team, ChecklistItem } from "@/lib/demo-data/workspace";

type DemoDataContextValue = { projects: Project[]; tasks: Task[]; teams: Team[]; notifications: Notification[]; activity: Activity[]; createProject: (project: Omit<Project, "id">) => Project; updateProject: (id: string, changes: Partial<Project>) => void; deleteProject: (id: string) => void; createTask: (task: Omit<Task, "id">) => Task; updateTask: (id: string, changes: Partial<Task>) => void; deleteTask: (id: string) => void; updateChecklistItem: (taskId: string, checklistItemId: string, completed: boolean) => void; createTeam: (team: Omit<Team, "id">) => Team; updateTeam: (id: string, changes: Partial<Team>) => void; deleteTeam: (id: string) => void; markNotificationRead: (id: string) => void; markAllNotificationsRead: (employeeId: string) => void };
const DemoDataContext = createContext<DemoDataContextValue | null>(null);

function readStored<T>(key: string, fallback: T): T { if (typeof window === "undefined") return fallback; const stored = window.localStorage.getItem(key); if (!stored) return fallback; try { return JSON.parse(stored) as T; } catch { return fallback; } }
function makeId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [projectState, setProjectState] = useState(() => readStored("nexaflow-projects", initialProjects));
  const [taskState, setTaskState] = useState(() => readStored("nexaflow-tasks", initialTasks));
  const [teamState, setTeamState] = useState(() => readStored("nexaflow-teams", initialTeams));
  const [notificationState, setNotificationState] = useState(() => {
    const stored = readStored("nexaflow-notifications", initialNotifications);
    const storedIds = new Set(stored.map((notification) => notification.id));
    return [...stored, ...initialNotifications.filter((notification) => !storedIds.has(notification.id))];
  });
  function persist<T>(key: string, items: T[]) { window.localStorage.setItem(key, JSON.stringify(items)); }
  function createProject(project: Omit<Project, "id">) { const created = { ...project, id: makeId("project") }; setProjectState((items) => { const next = [...items, created]; persist("nexaflow-projects", next); return next; }); return created; }
  function updateProject(id: string, changes: Partial<Project>) { setProjectState((items) => { const next = items.map((project) => project.id === id ? { ...project, ...changes } : project); persist("nexaflow-projects", next); return next; }); }
  function deleteProject(id: string) { setProjectState((items) => { const next = items.filter((project) => project.id !== id); persist("nexaflow-projects", next); return next; }); setTaskState((items) => { const next = items.filter((task) => task.projectId !== id); persist("nexaflow-tasks", next); return next; }); }
  function createTask(task: Omit<Task, "id">) { const created = { ...task, id: makeId("task") }; setTaskState((items) => { const next = [...items, created]; persist("nexaflow-tasks", next); return next; }); return created; }
  function updateTask(id: string, changes: Partial<Task>) { setTaskState((items) => { const next = items.map((task) => task.id === id ? { ...task, ...changes } : task); persist("nexaflow-tasks", next); return next; }); }
  function updateChecklistItem(taskId: string, checklistItemId: string, completed: boolean) { setTaskState((items) => { const next = items.map((task) => task.id === taskId ? { ...task, checklist: task.checklist.map((item) => item.id === checklistItemId ? { ...item, completed } : item) } : task); persist("nexaflow-tasks", next); return next; }); }
  function deleteTask(id: string) { setTaskState((items) => { const next = items.filter((task) => task.id !== id); persist("nexaflow-tasks", next); return next; }); }
  function createTeam(team: Omit<Team, "id">) { const created = { ...team, id: makeId("team") }; setTeamState((items) => { const next = [...items, created]; persist("nexaflow-teams", next); return next; }); return created; }
  function updateTeam(id: string, changes: Partial<Team>) { setTeamState((items) => { const next = items.map((team) => team.id === id ? { ...team, ...changes } : team); persist("nexaflow-teams", next); return next; }); }
  function deleteTeam(id: string) { setTeamState((items) => { const next = items.filter((team) => team.id !== id); persist("nexaflow-teams", next); return next; }); setProjectState((items) => { const next = items.map((project) => project.teamId === id ? { ...project, teamId: "" } : project); persist("nexaflow-projects", next); return next; }); }
  function markNotificationRead(id: string) { setNotificationState((items) => { const nextItems = items.map((notification) => notification.id === id ? { ...notification, read: true } : notification); window.localStorage.setItem("nexaflow-notifications", JSON.stringify(nextItems)); return nextItems; }); }
  const markAllNotificationsRead = useCallback((employeeId: string) => { setNotificationState((items) => { const nextItems = items.map((notification) => notification.employeeId === employeeId ? { ...notification, read: true } : notification); if (nextItems.some((notification, index) => notification.read !== items[index].read)) window.localStorage.setItem("nexaflow-notifications", JSON.stringify(nextItems)); return nextItems; }); }, []);
  return <DemoDataContext.Provider value={{ projects: projectState, tasks: taskState, teams: teamState, notifications: notificationState, activity: initialActivity, createProject, updateProject, deleteProject, createTask, updateTask, deleteTask, updateChecklistItem, createTeam, updateTeam, deleteTeam, markNotificationRead, markAllNotificationsRead }}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() { const context = useContext(DemoDataContext); if (!context) throw new Error("useDemoData must be used within DemoDataProvider"); return context; }
export { employees };