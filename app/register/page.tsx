import Link from "next/link";
import { register } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export default function RegisterPage() {
  return (
    <AuthShell caption="New driver" title="Create an account">
      <AuthForm
        action={register}
        submitLabel="Register"
        fields={[
          { name: "name", label: "Name", type: "text", autoComplete: "name" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
        ]}
      />
      <p className="text-center text-sm text-mist">
        Already registered? <Link href="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}
