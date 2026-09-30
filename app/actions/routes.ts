"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createPendingRoute } from "@/lib/routes";
import { fieldErrors, routeInputSchema } from "@/lib/validation";

export type RouteFormState = { errors?: Record<string, string>; values?: Record<string, string> };

function formValues(formData: FormData) {
  return Object.fromEntries([...formData].filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, String(v)]));
}

export async function submitRoute(_prev: RouteFormState, formData: FormData): Promise<RouteFormState> {
  const user = await requireUser();
  const values = formValues(formData);
  const parsed = routeInputSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  await createPendingRoute(parsed.data, user.id);
  redirect("/profile?submitted=1");
}
