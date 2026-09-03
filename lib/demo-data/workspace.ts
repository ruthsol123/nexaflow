export type ProjectStatus = "Planning" | "Active" | "Completed" | "On Hold";
export type TaskStatus = "To Do" | "In Progress" | "Review" | "Done";
export type Priority = "Low" | "Medium" | "High";
export type Employee = { id: string; name: string; email: string; title: string; department: string; status: "Active" | "Away"; teamId: string };
export type Project = { id: string; name: string; description: string; status: ProjectStatus; progress: number; startDate: string; deadline: string; managerId: string; teamId: string; memberIds: string[] };
export type ChecklistItem = { id: string; text: string; completed: boolean };
export type Task = { id: string; title: string; description: string; projectId: string; assigneeId: string; priority: Priority; status: TaskStatus; dueDate: string; checklist: ChecklistItem[] };
export type Team = { id: string; name: string; description: string; leadId: string; memberIds: string[]; projectIds: string[] };
export type Notification = { id: string; employeeId: string; message: string; detail: string; read: boolean; createdAt: string };
export type Activity = { id: string; actorId: string; message: string; projectId?: string; createdAt: string };

export const employees: Employee[] = [
  { id: "sarah", name: "Sarah Johnson", email: "employer@nexaflow.demo", title: "CEO", department: "Executive", status: "Active", teamId: "executive" },
  { id: "alex", name: "Alex Morgan", email: "employee@nexaflow.demo", title: "Frontend Developer", department: "Engineering", status: "Active", teamId: "engineering" },
  { id: "daniel", name: "Daniel Kim", email: "daniel@nexaflow.demo", title: "Backend Developer", department: "Engineering", status: "Active", teamId: "engineering" },
  { id: "maya", name: "Maya Chen", email: "maya@nexaflow.demo", title: "UI/UX Designer", department: "Design", status: "Active", teamId: "design" },
  { id: "riley", name: "Riley Stone", email: "riley@nexaflow.demo", title: "Product Manager", department: "Product", status: "Away", teamId: "product" },
  { id: "jordan", name: "Jordan Lee", email: "jordan@nexaflow.demo", title: "Growth Lead", department: "Marketing", status: "Active", teamId: "marketing" },
];
export const projects: Project[] = [
  { id: "website", name: "NexaFlow Website", description: "A clearer, faster marketing experience for modern teams.", status: "Active", progress: 78, startDate: "2026-07-01", deadline: "2026-08-30", managerId: "riley", teamId: "engineering", memberIds: ["alex", "daniel", "maya"] },
  { id: "mobile", name: "Mobile Application", description: "Bring the workspace to every team member on the move.", status: "Active", progress: 45, startDate: "2026-07-15", deadline: "2026-09-12", managerId: "riley", teamId: "engineering", memberIds: ["alex", "jordan"] },
  { id: "travel", name: "Travel Platform", description: "A flexible booking workflow for distributed teams.", status: "Active", progress: 62, startDate: "2026-06-15", deadline: "2026-09-05", managerId: "riley", teamId: "product", memberIds: ["maya", "riley", "daniel"] },
  { id: "migration", name: "API Migration", description: "Move core services to the next-generation platform.", status: "On Hold", progress: 34, startDate: "2026-08-01", deadline: "2026-09-18", managerId: "daniel", teamId: "engineering", memberIds: ["daniel", "alex"] },
];
export const tasks: Task[] = [
  { id: "auth", title: "Implement authentication", description: "Connect the demo sign-in flow to the new workspace shell.", projectId: "website", assigneeId: "alex", priority: "High", status: "In Progress", dueDate: "2026-08-25", checklist: [{ id: "c1", text: "Set up OAuth provider", completed: true }, { id: "c2", text: "Create login form component", completed: true }, { id: "c3", text: "Implement session management", completed: false }, { id: "c4", text: "Add logout functionality", completed: false }] },
  { id: "dashboard", title: "Build dashboard components", description: "Create reusable overview cards and activity panels.", projectId: "website", assigneeId: "alex", priority: "Medium", status: "In Progress", dueDate: "2026-08-27", checklist: [{ id: "c5", text: "Design stat card component", completed: true }, { id: "c6", text: "Create activity feed component", completed: false }, { id: "c7", text: "Implement progress indicators", completed: false }, { id: "c8", text: "Add responsive layout", completed: false }] },
  { id: "mobile-nav", title: "Fix mobile navigation", description: "Polish the responsive drawer and route transitions.", projectId: "mobile", assigneeId: "alex", priority: "High", status: "Review", dueDate: "2026-08-26", checklist: [{ id: "c9", text: "Fix drawer animation", completed: true }, { id: "c10", text: "Improve touch targets", completed: true }, { id: "c11", text: "Smooth route transitions", completed: false }, { id: "c12", text: "Test on mobile devices", completed: false }] },
  { id: "api-contract", title: "Document API contracts", description: "Capture the service boundaries for the migration team.", projectId: "migration", assigneeId: "daniel", priority: "Medium", status: "To Do", dueDate: "2026-09-02", checklist: [{ id: "c13", text: "Identify all service endpoints", completed: false }, { id: "c14", text: "Document request/response formats", completed: false }, { id: "c15", text: "Define error handling patterns", completed: false }, { id: "c16", text: "Create API documentation site", completed: false }] },
  { id: "design-review", title: "Share design review", description: "Review the latest mobile navigation prototypes.", projectId: "mobile", assigneeId: "maya", priority: "Low", status: "Done", dueDate: "2026-08-22", checklist: [{ id: "c17", text: "Review wireframes", completed: true }, { id: "c18", text: "Check accessibility compliance", completed: true }, { id: "c19", text: "Provide feedback notes", completed: true }, { id: "c20", text: "Share with team", completed: true }] },
  { id: "booking-flow", title: "Map booking flow", description: "Define the happy path and edge cases for travel booking.", projectId: "travel", assigneeId: "riley", priority: "High", status: "Done", dueDate: "2026-08-20", checklist: [{ id: "c21", text: "Map user journey", completed: true }, { id: "c22", text: "Identify edge cases", completed: true }, { id: "c23", text: "Create flow diagram", completed: true }, { id: "c24", text: "Document requirements", completed: true }] },
  { id: "campaign", title: "Prepare launch campaign", description: "Prepare launch messaging for the website release.", projectId: "website", assigneeId: "jordan", priority: "Medium", status: "To Do", dueDate: "2026-09-01", checklist: [{ id: "c25", text: "Draft key messages", completed: false }, { id: "c26", text: "Create email templates", completed: false }, { id: "c27", text: "Prepare social media content", completed: false }, { id: "c28", text: "Schedule announcements", completed: false }] },
];
export const teams: Team[] = [
  { id: "executive", name: "Executive", description: "Lead the company vision and strategy.", leadId: "sarah", memberIds: ["sarah"], projectIds: ["website", "mobile", "travel", "migration"] },
  { id: "engineering", name: "Engineering", description: "Build and maintain the NexaFlow product.", leadId: "daniel", memberIds: ["alex", "daniel"], projectIds: ["website", "mobile", "migration"] },
  { id: "design", name: "Design", description: "Shape a clear, thoughtful product experience.", leadId: "maya", memberIds: ["maya"], projectIds: ["website", "mobile", "travel"] },
  { id: "product", name: "Product", description: "Connect customer needs to focused delivery.", leadId: "riley", memberIds: ["riley"], projectIds: ["travel"] },
  { id: "marketing", name: "Marketing", description: "Help modern teams discover NexaFlow.", leadId: "jordan", memberIds: ["jordan"], projectIds: ["website"] },
];
export const notifications: Notification[] = [
  { id: "n1", employeeId: "employee@nexaflow.demo", message: "You were assigned a new task", detail: "Build dashboard components", read: false, createdAt: "Today" },
  { id: "n2", employeeId: "employee@nexaflow.demo", message: "A project deadline changed", detail: "NexaFlow Website is due Aug 30", read: false, createdAt: "Yesterday" },
  { id: "n3", employeeId: "employee@nexaflow.demo", message: "Sarah commented on your task", detail: "Looks ready for the next review.", read: true, createdAt: "Aug 21" },
  { id: "n4", employeeId: "employee@nexaflow.demo", message: "Your task moved to Review", detail: "Fix mobile navigation", read: true, createdAt: "Aug 20" },
  { id: "n5", employeeId: "sarah@nexaflow.demo", message: "Team update available", detail: "Weekly project summaries are ready", read: false, createdAt: "Today" },
];
export const activity: Activity[] = [
  { id: "a1", actorId: "alex", message: "completed a task in NexaFlow Website", projectId: "website", createdAt: "Today" },
  { id: "a2", actorId: "maya", message: "shared a new design review", projectId: "mobile", createdAt: "Yesterday" },
  { id: "a3", actorId: "daniel", message: "updated API Migration progress", projectId: "migration", createdAt: "Aug 21" },
  { id: "a4", actorId: "riley", message: "updated the Travel Platform brief", projectId: "travel", createdAt: "Aug 20" },
];
