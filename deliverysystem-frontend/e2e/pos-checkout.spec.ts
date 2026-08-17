import { test, expect } from "@playwright/test";

test.describe("Supermarket Delivery System - E2E Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("adds items to cart, checks out, and displays printable receipt", async ({ page }) => {
    // 1. Wait for product catalog to load and click "Add to Cart"
    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("+ Add to Cart")').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // 2. Fill customer details using exact placeholder matches
    await page.fill('input[placeholder*="Walk-In"]', "Abebe Bikila");
    await page.fill('input[placeholder*="Store Counter"]', "Addis Ababa");

    // 3. Complete checkout
    const checkoutButton = page.locator('button:has-text("Complete POS Checkout"), button:has-text("Complete POS Checkout & Print Receipt")').first();
    await checkoutButton.click();

    // 4. Assert receipt modal presence and customer name
    const receiptModal = page.locator("text=OFFICIAL POS RECEIPT");
    await expect(receiptModal).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Abebe Bikila")).toBeVisible();
  });

  test("switches UI language to Amharic", async ({ page }) => {
    // Click language switch button
    await page.click("button:has-text('አማርኛ')");

    // Assert localized header is visible
    await expect(page.locator("text=የሱፐርማርኬት ማድረሻ ስርአት")).toBeVisible();
  });
});