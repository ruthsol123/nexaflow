"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Layers3 } from "lucide-react";
import { DEMO_ACCOUNTS, saveDemoSession } from "@/lib/auth/demo-auth";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  function validateField(fieldName: string, value: string): string | undefined {
    switch (fieldName) {
      case "fullName":
        if (!value.trim()) return "Full name is required.";
        if (value.trim().length < 2) return "Full name must be at least 2 characters.";
        return undefined;
      case "email":
        if (!value.trim()) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
        return undefined;
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must be at least 8 characters.";
        return undefined;
      case "confirmPassword":
        if (!value) return "Please confirm your password.";
        return undefined;
      default:
        return undefined;
    }
  }

  function handleFieldBlur(fieldName: string, value: string) {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    const fieldError = validateField(fieldName, value);
    setFieldErrors(prev => ({ ...prev, [fieldName]: fieldError }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setFieldErrors({});
    setTouchedFields(new Set());

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    // Validate all fields
    const errors: FormErrors = {};
    if (isSignup) {
      const fullNameError = validateField("fullName", fullName);
      if (fullNameError) errors.fullName = fullNameError;
    }
    
    const emailError = validateField("email", email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validateField("password", password);
    if (passwordError) errors.password = passwordError;
    
    if (isSignup) {
      const confirmPasswordError = validateField("confirmPassword", confirmPassword);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    }

    if (isSignup && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields(new Set(["fullName", "email", "password", "confirmPassword"]));
      return;
    }

    const account = DEMO_ACCOUNTS.find((demoAccount) => demoAccount.email === email && demoAccount.password === password);
    if (!isSignup && !account) {
      setError("Invalid email or password.");
      return;
    }

    if (isSignup) {
      setIsSubmitting(true);
      window.setTimeout(() => {
        setIsSubmitting(false);
        setMessage("Authentication will be connected in the next development phase.");
      }, 450);
      return;
    }

    if (!account) return;

    setIsSubmitting(true);
    saveDemoSession(account);
    window.setTimeout(() => router.replace(`/dashboard/${account.role}`), 300);
  }

  return (
    <main className="theme-auth flex min-h-screen items-center justify-center bg-[#070b13] px-4 pt-24 pb-8 text-white sm:px-6 sm:pb-12">
      <section className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white sm:mb-10">
          <ArrowLeft size={15} /> Back to NexaFlow
        </Link>
        <div className="mb-6 flex items-center gap-2.5 font-semibold tracking-tight sm:mb-8">
          <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-300 text-[#07101d]"><Layers3 size={17} strokeWidth={2.5} /></span>
          NexaFlow
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0d1421] p-5 shadow-2xl sm:p-6 lg:p-8">
          <h1 className="display-font text-2xl tracking-tight sm:text-3xl lg:text-4xl">{isSignup ? "Create your NexaFlow account" : "Welcome back"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400 sm:mt-3">{isSignup ? "Start organizing your team's work in one place." : "Log in to continue to your workspace."}</p>
          {!isSignup && <div className="mt-4 rounded-lg border border-cyan-300/15 bg-cyan-300/6 px-3 py-2 text-xs leading-5 text-cyan-100 sm:mt-5 sm:py-2.5" role="note">Demo mode — authentication is currently running locally.</div>}
          <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSubmit} noValidate>
            {isSignup && <Field id="fullName" label="Full name" type="text" autoComplete="name" error={fieldErrors.fullName} onBlur={(e) => handleFieldBlur("fullName", e.target.value)} />}
            <Field id="email" label="Email" type="email" autoComplete="email" error={fieldErrors.email} onBlur={(e) => handleFieldBlur("email", e.target.value)} />
            <Field id="password" label="Password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} error={fieldErrors.password} onBlur={(e) => handleFieldBlur("password", e.target.value)} />
            {isSignup && <Field id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" error={fieldErrors.confirmPassword} onBlur={(e) => handleFieldBlur("confirmPassword", e.target.value)} />}
            {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
            {message && <p className="rounded-lg border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 text-sm leading-5 text-cyan-100 sm:py-2.5" role="status">{message}</p>}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-[#07101d] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : isSignup ? "Create account" : "Log in"}{!isSubmitting && <ArrowRight size={15} />}</button>
          </form>
          {!isSignup && <div className="mt-5 border-t border-white/8 pt-4 sm:mt-6 sm:pt-5"><button className="text-xs font-medium text-slate-400 underline-offset-4 hover:text-white hover:underline" type="button" onClick={() => setShowCredentials(!showCredentials)}>{showCredentials ? "Hide demo credentials" : "View demo credentials"}</button>{showCredentials && <div className="mt-3 space-y-3 text-xs text-slate-400"><div><p className="font-medium text-slate-200">Employer Demo</p><p>{DEMO_ACCOUNTS[0].email}</p><p className="text-slate-500">Password: {DEMO_ACCOUNTS[0].password}</p></div><div><p className="font-medium text-slate-200">Employee Demo</p><p>{DEMO_ACCOUNTS[1].email}</p><p className="text-slate-500">Password: {DEMO_ACCOUNTS[1].password}</p></div><p className="text-[11px] text-slate-600">Demo only. These are not production credentials.</p></div>}</div>}
          <p className="mt-6 text-center text-sm text-slate-400 sm:mt-7">{isSignup ? "Already have an account?" : "Don't have an account?"}{" "}<Link className="font-medium text-cyan-300 transition-colors hover:text-cyan-200" href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link></p>
        </div>
      </section>
    </main>
  );
}

function Field({ id, label, type, autoComplete, error, onBlur }: { id: string; label: string; type: string; autoComplete: string; error?: string; onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void }) {
  return <div><label className="mb-2 block text-sm font-medium text-slate-200" htmlFor={id}>{label}</label><input className={`w-full rounded-lg border px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2 ${error ? 'border-rose-500/50 bg-[#09111e] focus:border-rose-500 focus:ring-rose-500/15' : 'border-white/12 bg-[#09111e] focus:border-cyan-300/70 focus:ring-cyan-300/15'}`} id={id} name={id} type={type} autoComplete={autoComplete} required onBlur={onBlur} />{error && <p className="mt-1 text-xs text-rose-300">{error}</p>}</div>;
}
