import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/landing/Navbar";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <AuthForm mode="login" />
    </>
  );
}
