export type DemoRole = "employer" | "employee";

export type DemoAccount = {
  email: string;
  password: string;
  role: DemoRole;
  accountType: "company" | "employee";
  displayName: string;
  companyName?: string;
  companySize?: string;
};

export type DemoSession = Pick<DemoAccount, "email" | "role" | "accountType" | "displayName">;

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "employer@nexaflow.demo",
    password: "Employer123!",
    role: "employer",
    accountType: "company",
    displayName: "Sarah",
  },
  {
    email: "employee@nexaflow.demo",
    password: "Employee123!",
    role: "employee",
    accountType: "employee",
    displayName: "Alex",
  },
];

const SESSION_KEY = "nexaflow-demo-session";
const CREATED_ACCOUNTS_KEY = "nexaflow-demo-accounts";

export function getDemoAccounts(): DemoAccount[] {
  if (typeof window === "undefined") return DEMO_ACCOUNTS;
  const rawAccounts = window.localStorage.getItem(CREATED_ACCOUNTS_KEY);
  if (!rawAccounts) return DEMO_ACCOUNTS;
  try {
    const createdAccounts = (JSON.parse(rawAccounts) as DemoAccount[]).map((account) => ({
      ...account,
      accountType: account.accountType ?? (account.role === "employer" ? "company" : "employee"),
    }));
    return [...DEMO_ACCOUNTS, ...createdAccounts];
  } catch {
    window.localStorage.removeItem(CREATED_ACCOUNTS_KEY);
    return DEMO_ACCOUNTS;
  }
}

export function saveDemoAccount(account: DemoAccount) {
  if (typeof window === "undefined") return;
  const createdAccounts = getDemoAccounts().filter((item) => !DEMO_ACCOUNTS.some((demoAccount) => demoAccount.email === item.email));
  window.localStorage.setItem(CREATED_ACCOUNTS_KEY, JSON.stringify([...createdAccounts, account]));
}

export function saveDemoSession(account: DemoAccount) {
  if (typeof window === "undefined") return;
  const session: DemoSession = {
    email: account.email,
    role: account.role,
    accountType: account.accountType,
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
