import { describe, expect, it } from "vitest";
import { parseFilters } from "@/lib/filters";

describe("parseFilters", () => {
  it("returns empty filters for empty params", () => {
    expect(parseFilters({})).toEqual({});
  });

  it("parses valid values", () => {
    expect(
      parseFilters({ q: " kojori ", region: "Tbilisi", minScenery: "8", minRoad: "6", difficulty: "easy" }),
    ).toEqual({ q: "kojori", region: "Tbilisi", minScenery: 8, minRoad: 6, difficulty: "easy" });
  });

  it("drops invalid values instead of throwing", () => {
    expect(parseFilters({ minScenery: "11", minRoad: "abc", difficulty: "insane" })).toEqual({});
  });

  it("treats blank strings as unset", () => {
    expect(parseFilters({ q: "   ", region: "", minScenery: "" })).toEqual({});
  });

  it("uses the first value of repeated params", () => {
    expect(parseFilters({ difficulty: ["moderate", "easy"] })).toEqual({ difficulty: "moderate" });
  });
});
