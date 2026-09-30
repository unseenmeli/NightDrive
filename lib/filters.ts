import { z } from "zod";

export const DIFFICULTIES = ["easy", "moderate", "challenging"] as const;

const optionalText = z
  .string()
  .trim()
  .max(100)
  .transform((v) => v || undefined)
  .optional()
  .catch(undefined);

const optionalRating = z.coerce.number().int().min(1).max(10).optional().catch(undefined);

const filtersSchema = z.object({
  q: optionalText,
  region: optionalText,
  minScenery: optionalRating,
  minRoad: optionalRating,
  difficulty: z.enum(DIFFICULTIES).optional().catch(undefined),
});

export type RouteFilters = z.infer<typeof filtersSchema>;

type SearchParams = Record<string, string | string[] | undefined>;

// Turns raw URL search params into clean filters. Invalid values are dropped, never thrown.
export function parseFilters(params: SearchParams): RouteFilters {
  const first = (key: string) => {
    const value = params[key];
    const v = Array.isArray(value) ? value[0] : value;
    return v === "" ? undefined : v;
  };
  return filtersSchema.parse({
    q: first("q"),
    region: first("region"),
    minScenery: first("minScenery"),
    minRoad: first("minRoad"),
    difficulty: first("difficulty"),
  });
}
