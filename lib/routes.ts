import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "./db";

const { routes } = schema;

export async function listApprovedRoutes() {
  return db
    .select()
    .from(routes)
    .where(eq(routes.status, "approved"))
    .orderBy(desc(routes.featured), routes.title);
}

export async function getApprovedRoute(slug: string) {
  const [route] = await db
    .select()
    .from(routes)
    .where(and(eq(routes.slug, slug), eq(routes.status, "approved")))
    .limit(1);
  return route ?? null;
}
