import { expect, test } from "@playwright/test";

// Placeholder E2E test demonstrating file upload and chat flow
// Assumes the Tauri app is running on localhost:1420 in dev mode

test("can load app home page", async ({ page }) => {
  await page.goto("http://localhost:1420");
  await expect(page).toHaveTitle(/DesktopChat/);
});
