"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Layers3 } from "lucide-react";
import { DEMO_ACCOUNTS, getDemoAccounts, saveDemoAccount, saveDemoSession } from "@/lib/auth/demo-auth";

type AuthMode = "login" | "signup";
type AccountType = "company" | "employee";
type FormErrors = Record<string, string>;

const companySizes = ["1–10", "11–50", "51–200", "201–500", "500+"];

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType | null>(isSignup ? null : "employee");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function chooseType(type: AccountType) {
    setAccountType(type);
    setErrors({});
    setError("");
    setMessage("");
  }

  function validate(formData: FormData): FormErrors {
    const next: FormErrors = {};
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (isSignup && !fullName) next.fullName = "Full name is required.";
    else if (isSignup && fullName.length < 2) next.fullName = "Enter at least 2 characters.";
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (isSignup && !confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (isSignup && password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    if (isSignup && accountType === "company") {
      if (!String(formData.get("companyName") ?? "").trim()) next.companyName = "Company name is required.";
      if (!String(formData.get("companySize") ?? "")) next.companySize = "Select a company size.";
    }
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    if (!isSignup) {
      const account = getDemoAccounts().find((item) => item.email.toLowerCase() === email && item.password === password);
      if (!account) {
        setError("We could not match that email and password.");
        return;
      }
      setIsSubmitting(true);
      saveDemoSession(account);
      window.setTimeout(() => router.replace(`/dashboard/${account.role}`), 300);
      return;
    }
    if (!accountType) return setError("Choose an account type to continue.");
    if (getDemoAccounts().some((item) => item.email.toLowerCase() === email)) {
      setErrors({ email: "An account with this email already exists." });
      return;
    }
    setIsSubmitting(true);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const account = { email, password, role: accountType === "company" ? "employer" as const : "employee" as const, accountType, displayName: fullName, companyName: accountType === "company" ? String(formData.get("companyName") ?? "").trim() : undefined, companySize: accountType === "company" ? String(formData.get("companySize") ?? "") : undefined };
    saveDemoAccount(account);
    saveDemoSession(account);
    setMessage("Your account is ready. Taking you to your workspace...");
    window.setTimeout(() => router.replace(`/dashboard/${account.role}`), 450);
  }

  return (
    <main className="theme-auth min-h-screen bg-slate-50 px-4 pb-10 pt-28 text-slate-900 sm:px-6 sm:pb-14">
      <section className="mx-auto w-full max-w-lg">
        <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900 sm:mb-9"><ArrowLeft size={15} /> Back to NexaFlow</Link>
        <div className="mb-6 flex items-center gap-2.5 font-semibold tracking-tight sm:mb-8"><span className="flex size-8 items-center justify-center rounded-lg bg-cyan-300 text-[#07101d]"><Layers3 size={17} strokeWidth={2.5} /></span>NexaFlow</div>
        <div className="auth-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7 lg:p-8">
          <h1 className="display-font text-3xl tracking-tight text-slate-950 sm:text-4xl">{isSignup ? "Create your NexaFlow account" : "Welcome back"}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{isSignup ? "Choose how you will use NexaFlow, then create your workspace access." : "Log in to continue to your workspace."}</p>
          {!isSignup && <div className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-xs leading-5 text-cyan-900" role="note">Demo mode — authentication is currently running locally.</div>}
          {isSignup && !accountType ? <AccountTypeSelector onSelect={chooseType} /> : (
            <form className="mt-7 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSubmit} noValidate>
              {isSignup && <div className="flex items-center justify-between rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-sm text-cyan-900"><span>Account Type: <b>{accountType === "company" ? "Company" : "Employee"}</b></span><button type="button" className="font-semibold underline underline-offset-4" onClick={() => setAccountType(null)}>Change</button></div>}
              {isSignup && <Field id="fullName" label="Full name" autoComplete="name" error={errors.fullName} />}
              {isSignup && accountType === "company" && <Field id="companyName" label="Company name" autoComplete="organization" error={errors.companyName} />}
              <Field id="email" label={isSignup && accountType === "company" ? "Company email" : "Email"} type="email" autoComplete="email" error={errors.email} />
              {isSignup && accountType === "company" && <SelectField id="companySize" label="Company size" options={companySizes} error={errors.companySize} />}
              <PasswordField id="password" label="Password" valueVisible={showPassword} onToggle={() => setShowPassword((visible) => !visible)} error={errors.password} autoComplete={isSignup ? "new-password" : "current-password"} />
              {isSignup && <PasswordField id="confirmPassword" label="Confirm password" valueVisible={showConfirmPassword} onToggle={() => setShowConfirmPassword((visible) => !visible)} error={errors.confirmPassword} autoComplete="new-password" />}
              {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
              {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm leading-5 text-emerald-800" role="status">{message}</p>}
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#10213b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c3557] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : isSignup ? "Create account" : "Log in"}{!isSubmitting && <ArrowRight size={15} />}</button>
            </form>
          )}
          {!isSignup && <div className="mt-6 border-t border-slate-200 pt-4"><button className="text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline" type="button" onClick={() => setShowCredentials((visible) => !visible)}>{showCredentials ? "Hide demo credentials" : "View demo credentials"}</button>{showCredentials && <div className="mt-3 space-y-3 text-xs text-slate-500"><DemoCredential label="Employer Demo" account={DEMO_ACCOUNTS[0]} /><DemoCredential label="Employee Demo" account={DEMO_ACCOUNTS[1]} /></div>}</div>}
          <p className="mt-6 text-center text-sm text-slate-500">{isSignup ? "Already have an account?" : "Don't have an account?"}{" "}<Link className="font-semibold text-cyan-700 transition hover:text-cyan-900" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link></p>
        </div>
      </section>
    </main>
  );
}

function AccountTypeSelector({ onSelect }: { onSelect: (type: AccountType) => void }) {
  return <div className="mt-7 space-y-3 sm:mt-8"><p className="text-sm font-semibold text-slate-900">Choose your account type:</p><div className="grid gap-3"><AccountTypeCard title="Company Account" description="For organizations managing projects and teams." onClick={() => onSelect("company")} /><AccountTypeCard title="Employee Account" description="For team members working on assigned tasks." onClick={() => onSelect("employee")} /></div></div>;
}

function AccountTypeCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="auth-choice flex w-full items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300"><span><span className="block font-semibold text-slate-900">{title}</span><span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span></span><ArrowRight className="mt-1 shrink-0 text-cyan-700" size={18} /></button>;
}

function Field({ id, label, type = "text", autoComplete, error }: { id: string; label: string; type?: string; autoComplete: string; error?: string }) {
  return <div><label className="auth-label mb-2 block text-sm font-medium text-slate-700" htmlFor={id}>{label}</label><input className={`auth-input w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 ${error ? "border-rose-400" : "border-slate-300"}`} id={id} name={id} type={type} autoComplete={autoComplete} required aria-invalid={Boolean(error)} />{error && <p className="mt-1.5 text-xs text-rose-600" role="alert">{error}</p>}</div>;
}

function SelectField({ id, label, options, error }: { id: string; label: string; options: string[]; error?: string }) {
  return <div><label className="auth-label mb-2 block text-sm font-medium text-slate-700" htmlFor={id}>{label}</label><select className={`auth-input w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 ${error ? "border-rose-400" : "border-slate-300"}`} id={id} name={id} required defaultValue=""><option value="">Select company size</option>{options.map((option) => <option key={option}>{option}</option>)}</select>{error && <p className="mt-1.5 text-xs text-rose-600" role="alert">{error}</p>}</div>;
}

function PasswordField({ id, label, autoComplete, valueVisible, onToggle, error }: { id: string; label: string; autoComplete: string; valueVisible: boolean; onToggle: () => void; error?: string }) {
  return <div><label className="auth-label mb-2 block text-sm font-medium text-slate-700" htmlFor={id}>{label}</label><div className="relative"><input className={`auth-input w-full rounded-lg border bg-white px-3.5 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 ${error ? "border-rose-400" : "border-slate-300"}`} id={id} name={id} type={valueVisible ? "text" : "password"} autoComplete={autoComplete} required aria-invalid={Boolean(error)} /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-400 hover:text-slate-700" onClick={onToggle} aria-label={valueVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>{valueVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{error && <p className="mt-1.5 text-xs text-rose-600" role="alert">{error}</p>}</div>;
}

function DemoCredential({ label, account }: { label: string; account: (typeof DEMO_ACCOUNTS)[number] }) {
  return <div><p className="font-medium text-slate-700">{label}</p><p>{account.email}</p><p>Password: {account.password}</p></div>;
}
