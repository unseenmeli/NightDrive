import { and, asc, desc, eq, gte, ilike, or, type SQL } from "drizzle-orm";
import { db, schema } from "./db";
import type { RouteFilters } from "./filters";
import { slugify, type RouteInput } from "./validation";

const { routes } = schema;

export async function listApprovedRoutes(filters: RouteFilters = {}) {
  const conditions: SQL[] = [eq(routes.status, "approved")];

  if (filters.q) {
    const pattern = `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`;
    conditions.push(
      or(
        ilike(routes.title, pattern),
        ilike(routes.startName, pattern),
        ilike(routes.endName, pattern),
        ilike(routes.region, pattern),
        ilike(routes.description, pattern),
      )!,
    );
  }
  if (filters.region) conditions.push(eq(routes.region, filters.region));
  if (filters.minScenery) conditions.push(gte(routes.scenery, filters.minScenery));
  if (filters.minRoad) conditions.push(gte(routes.roadQuality, filters.minRoad));
  if (filters.difficulty) conditions.push(eq(routes.difficulty, filters.difficulty));

  return db
    .select()
    .from(routes)
    .where(and(...conditions))
    .orderBy(desc(routes.featured), asc(routes.title));
}

export async function listRegions() {
  const rows = await db
    .selectDistinct({ region: routes.region })
    .from(routes)
    .where(eq(routes.status, "approved"))
    .orderBy(asc(routes.region));
  return rows.map((r) => r.region);
}

export async function getApprovedRoute(slug: string) {
  const [route] = await db
    .select()
    .from(routes)
    .where(and(eq(routes.slug, slug), eq(routes.status, "approved")))
    .limit(1);
  return route ?? null;
}

async function uniqueSlug(title: string) {
  const base = slugify(title);
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const [taken] = await db.select({ id: routes.id }).from(routes).where(eq(routes.slug, slug)).limit(1);
    if (!taken) return slug;
  }
}

export async function createPendingRoute(input: RouteInput, userId: number) {
  const [route] = await db
    .insert(routes)
    .values({ ...input, slug: await uniqueSlug(input.title), status: "pending", submittedBy: userId })
    .returning();
  return route;
}

export async function listRoutesByUser(userId: number) {
  return db.select().from(routes).where(eq(routes.submittedBy, userId)).orderBy(desc(routes.createdAt));
}
