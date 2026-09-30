import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  email,
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

// First error message per field, for displaying next to form inputs.
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
