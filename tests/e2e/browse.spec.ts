import { expect, test } from "@playwright/test";

// Read-only checks, safe to run against production.
test.describe("browsing @smoke", () => {
  test("home page lists routes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "NightDrive" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tbilisi to Kojori" })).toBeVisible();
  });

  test("route details page", async ({ page }) => {
    await page.goto("/routes/tbilisi-kojori");
    await expect(page.getByRole("heading", { level: 1, name: "Tbilisi to Kojori" })).toBeVisible();
    await expect(page.getByText("Scenery: 9/10")).toBeVisible();
  });

  test("search filters the list", async ({ page }) => {
    await page.goto("/?q=kojori");
    await expect(page.getByRole("link", { name: "Tbilisi to Kojori" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Batumi to Sarpi coast road" })).toHaveCount(0);
  });

  test("unknown route returns 404", async ({ page }) => {
    const response = await page.goto("/routes/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  });
});
