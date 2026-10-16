import { describe, expect, it } from "vitest";
import { fieldErrors, parsePath, registerSchema, routeInputSchema, slugify } from "@/lib/validation";

describe("registerSchema", () => {
  it("normalizes email", () => {
    const result = registerSchema.parse({ name: " Ana ", email: " Ana@Example.COM ", password: "12345678" });
    expect(result).toEqual({ name: "Ana", email: "ana@example.com", password: "12345678" });
  });

  it("reports one message per field", () => {
    const result = registerSchema.safeParse({ name: "", email: "nope", password: "short" });
    expect(result.success).toBe(false);
    expect(Object.keys(fieldErrors(result.error!)).sort()).toEqual(["email", "name", "password"]);
  });
});

describe("parsePath", () => {
  it("parses one point per line and ignores blank lines", () => {
    expect(parsePath("41.69, 44.80\n\n 41.66,44.70 \n")).toEqual([
      [41.69, 44.8],
      [41.66, 44.7],
    ]);
  });

  it("rejects malformed or out-of-range points", () => {
    expect(parsePath("41.69")).toBeNull();
    expect(parsePath("abc, 44")).toBeNull();
    expect(parsePath("91, 44")).toBeNull();
  });
});

describe("slugify", () => {
  it("makes url-safe slugs", () => {
    expect(slugify("Tbilisi → Kojori (night)")).toBe("tbilisi-kojori-night");
    expect(slugify("Café Route")).toBe("cafe-route");
    expect(slugify("→→")).toBe("route");
  });
});

describe("routeInputSchema", () => {
  const valid = {
    title: "Test Route",
    startName: "A",
    endName: "B",
    region: "Tbilisi",
    distanceKm: "10",
    durationMin: "20",
    scenery: "8",
    roadQuality: "7",
    difficulty: "easy",
    bestFor: "coupes, , night views",
    bestTime: "",
    description: "A nice short drive.",
    notes: "",
    path: "41.1, 44.1\n41.2, 44.2",
  };

  it("coerces form strings into a route", () => {
    const result = routeInputSchema.parse(valid);
    expect(result.distanceKm).toBe(10);
    expect(result.bestFor).toEqual(["coupes", "night views"]);
    expect(result.bestTime).toBeNull();
    expect(result.path).toHaveLength(2);
  });

  it("requires at least two path points", () => {
    const result = routeInputSchema.safeParse({ ...valid, path: "41.1, 44.1" });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).path).toMatch(/at least 2 points/);
  });

  it("rejects ratings out of range", () => {
    const result = routeInputSchema.safeParse({ ...valid, scenery: "11" });
    expect(fieldErrors(result.error!).scenery).toBe("1–10");
  });
});
