export type DemoRole = "employer" | "employee";

export type DemoAccount = {
  email: string;
  password: string;
  role: DemoRole;
  displayName: string;
};

export type DemoSession = Pick<DemoAccount, "email" | "role" | "displayName">;

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "sarah@nexaflow.demo",
    password: "Employer123!",
    role: "employer",
    displayName: "Sarah",
  },
  {
    email: "employee@nexaflow.demo",
    password: "Employee123!",
    role: "employee",
    displayName: "Alex",
  },
];

const SESSION_KEY = "nexaflow-demo-session";

export function saveDemoSession(account: DemoAccount) {
  if (typeof window === "undefined") return;
  const session: DemoSession = {
    email: account.email,
    role: account.role,
    displayName: account.displayName,
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const rawSession = window.localStorage.getItem(SESSION_KEY);
  if (!rawSession) return null;
  try {
    const session = JSON.parse(rawSession) as DemoSession;
    if (session.email && session.role && session.displayName) return session;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
  }
  return null;
}

export function clearDemoSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}
