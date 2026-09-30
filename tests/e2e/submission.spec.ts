import { expect, test, type Page } from "@playwright/test";

// Full flow: writes to the database, so it only runs against local/CI databases.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@nightdrive.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-please";

async function register(page: Page, name: string) {
  await page.goto("/register");
  const main = page.getByRole("main");
  await main.getByLabel("Name").fill(name);
  await main.getByLabel("Email").fill(`${name.toLowerCase()}-${Date.now()}@test.dev`);
  await main.getByLabel("Password").fill("password123");
  await main.getByRole("button", { name: "Register" }).click();
  await expect(page.getByRole("link", { name })).toBeVisible();
}

async function submitRoute(page: Page, title: string) {
  await page.goto("/submit");
  const fields: Record<string, string> = {
    Title: title,
    Start: "Test Start",
    End: "Test End",
    Region: "Testland",
    "Distance (km)": "15",
    "Duration (minutes)": "25",
    "Scenery (1–10)": "8",
    "Road quality (1–10)": "7",
    Description: "An end-to-end test route.",
    Waypoints: "41.70, 44.80\n41.66, 44.70",
  };
  for (const [label, value] of Object.entries(fields)) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await page.getByLabel("Difficulty").selectOption("easy");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByRole("status")).toContainText("submitted for review");
}

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  const main = page.getByRole("main");
  await main.getByLabel("Email").fill(ADMIN_EMAIL);
  await main.getByLabel("Password").fill(ADMIN_PASSWORD);
  await main.getByRole("button", { name: "Log in" }).click();
  await expect(page.locator('nav a[href="/admin"]')).toBeVisible();
}

test.skip(!!process.env.BASE_URL, "mutating tests never run against deployed environments");

test("submitted route is hidden until an admin approves it", async ({ browser }) => {
  const title = `E2E Approved ${Date.now()}`;
  const user = await (await browser.newContext()).newPage();
  await register(user, "Driver");
  await submitRoute(user, title);
  await expect(user.getByRole("listitem").filter({ hasText: title })).toContainText("pending");

  await user.goto(`/?q=${encodeURIComponent(title)}`);
  await expect(user.getByText("No routes match your filters.")).toBeVisible();

  const admin = await (await browser.newContext()).newPage();
  await loginAsAdmin(admin);
  await admin.goto("/admin");
  await admin.getByRole("listitem").filter({ hasText: title }).getByRole("button", { name: "Approve" }).click();
  await expect(admin.getByRole("listitem").filter({ hasText: title })).toHaveCount(0);

  await user.goto(`/?q=${encodeURIComponent(title)}`);
  await user.getByRole("link", { name: title }).click();
  await expect(user.getByRole("heading", { level: 1, name: title })).toBeVisible();
});

test("rejected route shows the reason to its author", async ({ browser }) => {
  const title = `E2E Rejected ${Date.now()}`;
  const user = await (await browser.newContext()).newPage();
  await register(user, "Rider");
  await submitRoute(user, title);

  const admin = await (await browser.newContext()).newPage();
  await loginAsAdmin(admin);
  await admin.goto("/admin");
  const item = admin.getByRole("listitem").filter({ hasText: title });
  await item.getByLabel("Reject reason").fill("Duplicate route");
  await item.getByRole("button", { name: "Reject" }).click();
  await expect(admin.getByRole("listitem").filter({ hasText: title })).toHaveCount(0);

  await user.goto("/profile");
  await expect(user.getByRole("listitem").filter({ hasText: title })).toContainText("Reason: Duplicate route");
});

test("non-admins cannot open the admin dashboard", async ({ page }) => {
  await register(page, "Nosy");
  await page.goto("/admin");
  await expect(page).toHaveURL("/");
});
