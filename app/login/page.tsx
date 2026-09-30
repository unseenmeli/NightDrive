import Link from "next/link";
import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main>
      <h1>Log in</h1>
      <AuthForm
        action={login}
        submitLabel="Log in"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
      />
      <p>
        No account? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}
