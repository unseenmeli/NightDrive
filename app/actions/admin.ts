"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import * as routes from "@/lib/routes";
import { fieldErrors, routeInputSchema } from "@/lib/validation";
import type { RouteFormState } from "./routes";

const id = z.coerce.number().int().positive();

export async function approveRoute(formData: FormData) {
  await requireAdmin();
  await routes.setRouteStatus(id.parse(formData.get("id")), "approved");
  redirect("/admin");
}

export async function rejectRoute(formData: FormData) {
  await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500) || null;
  await routes.setRouteStatus(id.parse(formData.get("id")), "rejected", reason);
  redirect("/admin");
}

export async function deleteRoute(formData: FormData) {
  await requireAdmin();
  await routes.deleteRoute(id.parse(formData.get("id")));
  redirect("/admin");
}

export async function updateRoute(
  routeId: number,
  _prev: RouteFormState,
  formData: FormData,
): Promise<RouteFormState> {
  await requireAdmin();
  const values = Object.fromEntries(
    [...formData].filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, String(v)]),
  );
  const parsed = routeInputSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  await routes.updateRoute(routeId, parsed.data);
  redirect("/admin");
}
