import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/landing/Navbar";

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <AuthForm mode="signup" />
    </>
  );
}
