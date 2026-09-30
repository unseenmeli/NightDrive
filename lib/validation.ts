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

const rating = z.coerce.number().int().min(1, "1–10").max(10, "1–10");

// Parses one "lat, lng" pair per line.
export function parsePath(text: string): [number, number][] | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const points: [number, number][] = [];
  for (const line of lines) {
    const parts = line.split(",").map((p) => Number(p.trim()));
    if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
    const [lat, lng] = parts;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    points.push([lat, lng]);
  }
  return points;
}

export const routeInputSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(100),
  startName: z.string().trim().min(1, "Required").max(80),
  endName: z.string().trim().min(1, "Required").max(80),
  region: z.string().trim().min(1, "Required").max(80),
  distanceKm: z.coerce.number().int().min(1, "Must be at least 1 km").max(2000),
  durationMin: z.coerce.number().int().min(1, "Must be at least 1 minute").max(3000),
  scenery: rating,
  roadQuality: rating,
  difficulty: z.enum(["easy", "moderate", "challenging"], "Pick a difficulty"),
  bestFor: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10),
    ),
  bestTime: z
    .string()
    .trim()
    .max(80)
    .default("")
    .transform((s) => s || null),
  description: z.string().trim().min(10, "Describe the route in a sentence or two").max(2000),
  notes: z
    .string()
    .trim()
    .max(1000)
    .default("")
    .transform((s) => s || null),
  path: z
    .string()
    .default("")
    .transform((s, ctx) => {
      const points = parsePath(s);
      if (!points || points.length < 2) {
        ctx.addIssue({ code: "custom", message: "Enter at least 2 points, one \"lat, lng\" per line" });
        return z.NEVER;
      }
      return points;
    }),
});

export type RouteInput = z.infer<typeof routeInputSchema>;

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "route";
}

// Inverse of routeInputSchema: turns a stored route back into form field strings.
export function routeToFormValues(route: {
  title: string;
  startName: string;
  endName: string;
  region: string;
  distanceKm: number;
  durationMin: number;
  scenery: number;
  roadQuality: number;
  difficulty: string;
  bestFor: string[];
  bestTime: string | null;
  description: string;
  notes: string | null;
  path: [number, number][];
}): Record<string, string> {
  return {
    title: route.title,
    startName: route.startName,
    endName: route.endName,
    region: route.region,
    distanceKm: String(route.distanceKm),
    durationMin: String(route.durationMin),
    scenery: String(route.scenery),
    roadQuality: String(route.roadQuality),
    difficulty: route.difficulty,
    bestFor: route.bestFor.join(", "),
    bestTime: route.bestTime ?? "",
    description: route.description,
    notes: route.notes ?? "",
    path: route.path.map(([lat, lng]) => `${lat}, ${lng}`).join("\n"),
  };
}
