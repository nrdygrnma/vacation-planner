import { expect, type Locator, type Page, test } from "@playwright/test";

function dialogContent(page: Page): Locator {
  return page
    .locator("[data-reka-dialog-content], [role='dialog']")
    .filter({ hasText: /add car rental/i })
    .first();
}

export async function openAddCarRentalModal(page: Page): Promise<Locator> {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");

  const addBtn = page
    .getByTestId("add-car-rental-btn")
    .or(page.getByRole("button", { name: /add car rental/i }))
    .first();

  await expect(addBtn).toBeVisible({ timeout: 20_000 });
  await addBtn.click();

  const dialog = dialogContent(page);
  await expect(dialog).toBeVisible({ timeout: 20_000 });

  return dialog;
}

test.describe("Car Rentals", () => {
  let tripId: string;
  let currencyId: string;

  test.beforeAll(async ({ request }) => {
    const currenciesResponse = await request.get("/api/currencies");
    const currencies = await currenciesResponse.json();
    currencyId = currencies?.[0]?.id;

    const response = await request.post("/api/trips", {
      data: {
        title: "Car Rental E2E Trip",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        currencyId,
        people: 1,
      },
    });
    const trip = await response.json();
    tripId = trip.id;
  });

  test.afterAll(async ({ request }) => {
    if (tripId) await request.delete(`/api/trips/${tripId}`);
  });

  async function openTripAndCarsTab(page: Page) {
    await page.goto(`/trips/${tripId}`);
    await page.getByRole("tab", { name: /car rentals/i }).click();
    await expect(page.getByTestId("add-car-rental-btn")).toBeVisible();
  }

  test("can add car rental", async ({ page }) => {
    await openTripAndCarsTab(page);
    const dialog = await openAddCarRentalModal(page);

    await dialog.getByLabel(/company/i).fill("Hertz");

    // Select car type
    await dialog.getByLabel(/car type/i).click();
    await page.locator('[role="option"]').first().click();

    // Select currency
    await dialog.getByLabel(/currency/i).click();
    await page.locator('[role="option"]').first().click();

    await dialog
      .getByLabel(/pick-up/i)
      .filter({ hasText: /location/i })
      .fill("Airport");
    await dialog.locator('input[type="date"]').first().fill("2024-12-01");
    await dialog.locator('input[type="time"]').first().fill("10:00");

    await dialog
      .getByLabel(/drop-off/i)
      .filter({ hasText: /location/i })
      .fill("City");
    await dialog.locator('input[type="date"]').nth(1).fill("2024-12-05");
    await dialog.locator('input[type="time"]').nth(1).fill("14:00");

    await dialog.getByLabel(/base rate/i).fill("200");

    await dialog.getByRole("button", { name: /^add car rental$/i }).click();

    await expect(page.getByText(/hertz/i)).toBeVisible();
    await expect(page.getByText(/airport/i)).toBeVisible();
  });

  test("can view car rental details", async ({ page }) => {
    await openTripAndCarsTab(page);

    const detailsBtn = page.getByRole("button", { name: /details/i }).first();
    await detailsBtn.click();

    await expect(
      page.locator('[role="dialog"]').getByText(/provider/i),
    ).toBeVisible();
    await expect(
      page.locator('[role="dialog"]').getByText(/hertz/i),
    ).toBeVisible();
  });

  test("can select car rental as final", async ({ page }) => {
    await openTripAndCarsTab(page);

    const selectBtn = page.getByRole("button", { name: /select/i }).first();
    await selectBtn.click();

    await expect(page.getByText(/selected/i)).toBeVisible();
  });
});
