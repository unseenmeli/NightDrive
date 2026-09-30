"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validation";

export type FormState = { errors?: Record<string, string>; values?: Record<string, string> };

// Echo back what the user typed (never the password) so the form isn't wiped on error.
function keep(formData: FormData, ...keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  const values = keep(formData, "name", "email");
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const { name, email, password } = parsed.data;

  const [user] = await db
    .insert(schema.users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: schema.users.email })
    .returning({ id: schema.users.id });
  if (!user) return { errors: { email: "An account with this email already exists" }, values };

  await createSession(user.id);
  redirect("/");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const values = keep(formData, "email");
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const { email, password } = parsed.data;

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { errors: { form: "Invalid email or password" }, values };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
