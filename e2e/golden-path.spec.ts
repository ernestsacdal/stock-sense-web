import { expect, test } from "@playwright/test";

/**
 * Golden path: log in as the seeded admin → dashboard → inventory
 * → log out. Verifies the auth context, protected app shell,
 * dashboard data fetching, inventory list, and the sidebar's email
 * dropdown logout all wire end-to-end.
 *
 * The Ask StockSense streaming flow is exercised by the backend
 * pytest suite (safety + executor + audit + answer synthesis) —
 * this spec stays focused on the FE+BE integration of the routine
 * app surfaces.
 *
 * Login is performed by evaluating fetch() inside the page context
 * so the httpOnly refresh cookie lands directly in the browser's
 * cookie jar. This sidesteps a Next 16 (webpack mode) hydration
 * race where Playwright was submitting the login form natively
 * before React's onSubmit handler had wired up.
 *
 * Requires:
 *  - backend running on :8001 with the demo dataset seeded
 *    (joe@coffee.dev / joepass123 — backend scripts/seed_demo.py
 *    or scripts/demo_reset.py).
 */
test("admin can log in, see the dashboard + inventory, and log out", async ({
  page,
}) => {
  const email = "joe@coffee.dev";
  const password = "joepass123";

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const status = await page.evaluate(async (creds) => {
    const r = await fetch("http://localhost:8001/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    return r.status;
  }, { email, password });
  expect(status).toBe(200);

  // ---- dashboard ----
  await page.goto("/");
  await expect(page.getByText("Total stock value").first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText("Active items").first()).toBeVisible();
  await expect(page.getByText("Expiring in 30 days").first()).toBeVisible();
  await expect(page.getByText("Low stock alerts").first()).toBeVisible();
  await expect(page.getByText("Stock value").first()).toBeVisible();
  await expect(page.getByText("Recent activity").first()).toBeVisible();

  // ---- inventory list (populated by seed_demo with 10 items) ----
  await page.getByRole("link", { name: /Inventory/ }).first().click();
  await expect(page).toHaveURL(/\/inventory$/);
  await expect(page.getByPlaceholder(/Search/i)).toBeVisible({
    timeout: 10_000,
  });
  // One of the seeded items should appear in the table.
  await expect(page.getByText("Espresso Beans 1kg").first()).toBeVisible({
    timeout: 10_000,
  });

  // ---- logout via the sidebar user-card dropdown ----
  // Click the user card button (shows the email + role); a small
  // popover opens above with Edit profile + Logout.
  await page.getByRole("button", { name: new RegExp(email) }).click();
  await page.getByRole("menuitem", { name: /Logout/i }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });
});
