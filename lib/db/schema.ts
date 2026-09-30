import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "moderate", "challenging"]);
export const routeStatusEnum = pgEnum("route_status", ["pending", "approved", "rejected"]);

export type LatLng = [number, number];
export type StopType = "fuel" | "cafe" | "viewpoint" | "parking";
export type Stop = { name: string; type: StopType; lat: number; lng: number; note?: string };

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  // SHA-256 of the session token; the raw token only lives in the cookie.
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  startName: text("start_name").notNull(),
  endName: text("end_name").notNull(),
  region: text("region").notNull(),
  distanceKm: integer("distance_km").notNull(),
  durationMin: integer("duration_min").notNull(),
  scenery: integer("scenery").notNull(),
  roadQuality: integer("road_quality").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  bestFor: text("best_for").array().notNull().default([]),
  bestTime: text("best_time"),
  description: text("description").notNull(),
  notes: text("notes"),
  path: jsonb("path").$type<LatLng[]>().notNull(),
  stops: jsonb("stops").$type<Stop[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  status: routeStatusEnum("status").notNull().default("pending"),
  rejectReason: text("reject_reason"),
  submittedBy: integer("submitted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
