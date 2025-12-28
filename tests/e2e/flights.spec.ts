import { expect, test } from "@playwright/test";

test.describe("Flights E2E", () => {
  let tripId: string;

  test.beforeAll(async ({ request }) => {
    // Get a currency first
    const currenciesResponse = await request.get("/api/currencies");
    const currencies = await currenciesResponse.json();
    const currencyId = currencies[0].id;

    // Create a trip to test flights on
    const response = await request.post("/api/trips", {
      data: {
        title: "E2E Test Trip " + Date.now(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        currencyId: currencyId,
        people: 1,
      },
    });
    const trip = await response.json();
    tripId = trip.id;
  });

  test.afterAll(async ({ request }) => {
    if (tripId) {
      await request.delete(`/api/trips/${tripId}`);
    }
  });

  test("should add and then edit a flight", async ({ page }) => {
    page.on("console", (msg) => console.log("BROWSER CONSOLE:", msg.text()));

    await page.goto(`/trips/${tripId}`);

    // Wait for the page to be ready
    await expect(page.getByText(/flights/i).first()).toBeVisible();

    // Click Add flight button
    const addButton = page.getByRole("button", { name: /add flight/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Wait for modal to be fully visible - try text first
    await expect(page.getByText("Add Flight").first()).toBeVisible({
      timeout: 15000,
    });

    // Check Airline Select
    const airlineSelect = page.getByTestId("airline-select");
    await expect(airlineSelect).toBeVisible({ timeout: 20000 });
    await airlineSelect.click();

    // Type to search
    await page.keyboard.type("Lufthansa");

    // Wait for options and select Lufthansa
    const lufthansaOption = page
      .getByRole("option", { name: /lufthansa/i })
      .first();
    await expect(lufthansaOption).toBeVisible({ timeout: 10000 });
    await lufthansaOption.click();

    // Fill in other required fields
    // Flight Number (should be auto-filled with LH or similar if we selected Lufthansa)
    // Actually the AirlineSelect emits 'change' which updates flightNumber
    const flightNumberInput = page.getByLabel(/flight number/i);
    // await expect(flightNumberInput).not.toHaveValue('');

    await flightNumberInput.fill("LH123");

    // Fill segments
    // From/To
    await page.getByLabel(/from/i).first().fill("FRA");
    await page.getByLabel(/to/i).first().fill("JFK");

    // Dates
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    await page.locator('input[type="date"]').nth(0).fill(today);
    await page.locator('input[type="time"]').nth(0).fill("10:00");
    await page.locator('input[type="date"]').nth(1).fill(today);
    await page.locator('input[type="time"]').nth(1).fill("14:00");

    // Base Fare
    await page.getByLabel(/base fare/i).fill("500");

    // Submit
    await page.getByRole("button", { name: /^add flight$/i }).click();

    // Verify flight card exists
    await expect(
      page
        .locator(".flight-card", { hasText: "LH123" })
        .or(page.getByText("LH123")),
    ).toBeVisible();

    // Edit flight
    await page.getByRole("button", { name: /edit/i }).first().click();
    await expect(page.getByText(/edit flight/i).first()).toBeVisible();

    await flightNumberInput.fill("LH456");
    await page.getByRole("button", { name: /save changes/i }).click();

    // Verify updated
    await expect(page.getByText("LH456")).toBeVisible();

    // Test Delete flight
    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();
    await expect(page.getByText(/delete flight/i).first()).toBeVisible();
    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText("LH456")).not.toBeVisible();

    // Test validation errors
    await page.getByRole("button", { name: /add flight/i }).click();
    await page.getByRole("button", { name: /^add flight$/i }).click();
    await expect(page.getByText(/airline is required/i)).toBeVisible();
    await expect(page.getByText(/departure date is required/i)).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: /cancel/i }).click();

    // Test Round Trip segments
    await page.getByRole("button", { name: /add flight/i }).click();

    // Select Airline
    const airlineSelect2 = page.getByTestId("airline-select");
    await airlineSelect2.click();
    await page.keyboard.type("Delta");
    await page.getByRole("option", { name: /delta/i }).first().click();

    // Toggle Round Trip
    const roundTripCheckbox = page.getByLabel(/round trip/i);
    await roundTripCheckbox.check();

    // Check that Return segments appear
    await expect(page.getByText(/return segments/i)).toBeVisible();

    // Fill Outbound
    await page.getByLabel(/from/i).first().fill("ATL");
    await page.getByLabel(/to/i).first().fill("LAX");
    await page.locator('input[type="date"]').nth(0).fill(today);
    await page.locator('input[type="time"]').nth(0).fill("08:00");
    await page.locator('input[type="date"]').nth(1).fill(today);
    await page.locator('input[type="time"]').nth(1).fill("11:00");

    // Fill Return
    await page.locator('input[type="date"]').nth(2).fill(tomorrow);
    await page.locator('input[type="time"]').nth(2).fill("15:00");
    await page.locator('input[type="date"]').nth(3).fill(tomorrow);
    await page.locator('input[type="time"]').nth(3).fill("18:00");

    await page.getByRole("button", { name: /^add flight$/i }).click();

    // Verify Round Trip flight card
    await expect(page.getByText("DL")).toBeVisible();
    await expect(page.getByText(/ATL → LAX/i)).toBeVisible();
  });
});
