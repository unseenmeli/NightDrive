import Link from "next/link";
import { register } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main>
      <h1>Create an account</h1>
      <AuthForm
        action={register}
        submitLabel="Register"
        fields={[
          { name: "name", label: "Name", type: "text", autoComplete: "name" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
        ]}
      />
      <p>
        Already registered? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
