import { describe, expect, it } from "vitest";
import { fieldErrors, registerSchema } from "@/lib/validation";

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
