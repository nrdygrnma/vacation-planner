import { expect, type Locator, type Page, test } from "@playwright/test";

function dialogContent(page: Page): Locator {
  // Nuxt UI / Reka
  return page
    .locator("[data-reka-dialog-content], [role='dialog']")
    .filter({ hasText: /add flight/i })
    .first();
}

export async function openAddFlightModal(page: Page): Promise<Locator> {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle"); // important for Nuxt hydration

  const addBtn = page
    .getByTestId("add-flight-btn")
    .or(page.getByRole("button", { name: /add flight/i }))
    .first();

  await expect(addBtn).toBeVisible({ timeout: 20_000 });
  await expect(addBtn).toBeEnabled({ timeout: 20_000 });
  await addBtn.scrollIntoViewIfNeeded();

  // Prove click works and then do the real click
  await addBtn.click({ trial: true });
  await addBtn.click();

  // If the click actually toggles the dialog, an overlay often appears
  // (Don’t fail the test if overlay selector differs; it’s a debug aid.)
  const overlay = page.locator("[data-reka-dialog-overlay]").first();
  await overlay.waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});

  const dialog = dialogContent(page);
  await expect(dialog).toBeVisible({ timeout: 20_000 });

  return dialog;
}

async function selectAirline(page: Page, dialog: Locator, airlineName: string) {
  // wait best-effort for airlines API
  const airlinesResp = page
    .waitForResponse(
      (r) => r.url().includes("/api/airlines") && r.status() < 500,
      {
        timeout: 15_000,
      },
    )
    .catch(() => null);

  const select = dialog.getByTestId("airline-select");
  await expect(select).toBeVisible({ timeout: 20_000 });
  await select.click();

  await airlinesResp;

  const listbox = page.locator('[role="listbox"]:visible').first();
  await expect(listbox).toBeVisible({ timeout: 20_000 });

  // some USelectMenus render a search input inside listbox
  const searchInput = listbox.locator("input").first();
  if (await searchInput.count()) {
    await searchInput.fill(airlineName);
  } else {
    await page.keyboard.type(airlineName);
  }

  const opt = page
    .locator('[role="option"]:visible')
    .filter({ hasText: new RegExp(airlineName, "i") })
    .first();

  await expect(opt).toBeVisible({ timeout: 20_000 });
  await opt.click();
}

function segmentCards(dialog: Locator) {
  return dialog.getByTestId("flight-segment");
}

async function fillSegment(
  card: Locator,
  data: {
    from: string;
    to: string;
    depDate: string;
    depTime: string;
    arrDate: string;
    arrTime: string;
  },
) {
  await card.locator('input[placeholder="LHR"]').fill(data.from);
  await card.locator('input[placeholder="CDG"]').fill(data.to);

  const dateInputs = card.locator('input[type="date"]');
  const timeInputs = card.locator('input[type="time"]');

  await expect(dateInputs).toHaveCount(2, { timeout: 20_000 });
  await expect(timeInputs).toHaveCount(2, { timeout: 20_000 });

  await dateInputs.nth(0).fill(data.depDate);
  await timeInputs.nth(0).fill(data.depTime);
  await dateInputs.nth(1).fill(data.arrDate);
  await timeInputs.nth(1).fill(data.arrTime);
}

async function closeModal(page: Page) {
  // safest generic close
  await page.keyboard.press("Escape").catch(() => {});
  await expect(dialogContent(page))
    .toHaveCount(0, { timeout: 10_000 })
    .catch(() => {});
}

test.describe("Flights – FlightFormNuxt", () => {
  test.setTimeout(120_000);

  async function submitFlightAndWaitForCreate(
    page: Page,
    dialog: Locator,
    tripId: string,
  ) {
    const createPromise = page.waitForResponse(
      async (r) => {
        if (
          r.request().method() !== "POST" ||
          !r.url().includes(`/api/trips/${tripId}/flights`)
        ) {
          return false;
        }
        return true;
      },
      { timeout: 20_000 },
    );

    await dialog.getByRole("button", { name: /^add flight$/i }).click();

    const resp = await createPromise;

    // If it failed, print the body so you immediately see why
    if (resp.status() >= 400) {
      const body = await resp.text().catch(() => "<no body>");
      throw new Error(
        `Create flight failed: ${resp.status()} ${resp.url()}\n${body}`,
      );
    }

    return await resp.json();
  }

  let tripId: string;
  let currencyId: string;

  test.beforeAll(async ({ request }) => {
    const currenciesResponse = await request.get("/api/currencies");
    expect(currenciesResponse.ok()).toBeTruthy();
    const currencies = await currenciesResponse.json();
    currencyId = currencies?.[0]?.id;
    expect(currencyId).toBeTruthy();

    const response = await request.post("/api/trips", {
      data: {
        title: "E2E Test Trip " + Date.now(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        currencyId,
        people: 1,
      },
    });

    expect(response.ok()).toBeTruthy();
    const trip = await response.json();
    tripId = trip.id;
    expect(tripId).toBeTruthy();
  });

  test.afterAll(async ({ request }) => {
    if (tripId) await request.delete(`/api/trips/${tripId}`);
  });

  async function openTrip(page: Page) {
    await page.goto(`/trips/${tripId}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/flights/i).first()).toBeVisible({
      timeout: 20_000,
    });
  }

  test("modal opens + empty submit shows validation", async ({ page }) => {
    await openTrip(page);

    // DEBUG: see if anything dialog-ish exists at all
    console.log(
      "dialog count:",
      await page.locator("[role='dialog'], [data-reka-dialog-content]").count(),
    );
    console.log(
      "overlay count:",
      await page.locator("[data-reka-dialog-overlay]").count(),
    );

    // DEBUG: capture screenshot right after click
    await page.screenshot({
      path: "after-add-flight-click.png",
      fullPage: true,
    });

    const dialog = await openAddFlightModal(page);

    // click modal submit (scoped inside dialog)
    await dialog.getByRole("button", { name: /^add flight$/i }).click();

    await expect(dialog.getByText(/^required$/i).first()).toBeVisible({
      timeout: 20_000,
    });

    await closeModal(page);
  });

  test("can add one-way flight", async ({ page }) => {
    await openTrip(page);
    const dialog = await openAddFlightModal(page);

    // ---- Debug helpers: capture whether ANY flight-POST happens ----
    const seenFlightPosts: string[] = [];
    const onReq = (req: any) => {
      const url = req.url?.() ?? "";
      const method = req.method?.() ?? "";
      if (
        method === "POST" &&
        url.includes("/api/trips/") &&
        url.includes("/flights")
      ) {
        seenFlightPosts.push(`${method} ${url}`);
      }
    };
    page.on("request", onReq);

    // Select airline (your helper)
    await selectAirline(page, dialog, "Lufthansa");

    // Fill flight number
    await dialog.getByLabel(/flight number/i).fill("LH123");

    // IMPORTANT: don’t try to locate “segment cards” (too many ancestor <div>s match).
    // Fill the FIRST segment inputs directly inside the dialog.
    const today = new Date().toISOString().split("T")[0];

    const fromInput = dialog.locator('input[placeholder="LHR"]').first();
    const toInput = dialog.locator('input[placeholder="CDG"]').first();
    await expect(fromInput).toBeVisible({ timeout: 20_000 });
    await expect(toInput).toBeVisible({ timeout: 20_000 });
    await fromInput.fill("FRA");
    await toInput.fill("JFK");

    const dateInputs = dialog.locator('input[type="date"]');
    const timeInputs = dialog.locator('input[type="time"]');
    await expect(dateInputs).toHaveCount(2, { timeout: 20_000 });
    await expect(timeInputs).toHaveCount(2, { timeout: 20_000 });

    await dateInputs.nth(0).fill(today); // departure date
    await timeInputs.nth(0).fill("10:00"); // departure time
    await dateInputs.nth(1).fill(today); // arrival date
    await timeInputs.nth(1).fill("14:00"); // arrival time

    await dialog.getByLabel(/base fare/i).fill("500");

    // Wait for the actual POST that creates the flight.
    // Don’t hardcode tripId here — just match the route pattern.
    const createRespPromise = page.waitForResponse(
      (r) => {
        try {
          if (r.request().method() !== "POST") return false;
          const path = new URL(r.url()).pathname;
          return /\/api\/trips\/[^/]+\/flights\/?$/.test(path);
        } catch {
          return false;
        }
      },
      { timeout: 20_000 },
    );

    // Click submit. Depending on your modal, the label might be "Add flight" or "Save".
    const submitBtn = dialog
      .getByRole("button", { name: /^add flight$/i })
      .or(dialog.getByRole("button", { name: /^save$/i }))
      .last();

    await expect(submitBtn).toBeVisible({ timeout: 20_000 });
    await submitBtn.click();

    let createResp;
    try {
      createResp = await createRespPromise;
    } catch (e) {
      // Super useful when this fails: you’ll see whether submit was blocked (validation) vs no network call.
      const screenshotPath = "debug-create-flight-timeout.png";
      await page
        .screenshot({ path: screenshotPath, fullPage: true })
        .catch(() => {});

      const visibleErrors = await dialog
        .locator(
          '[role="alert"], [data-slot="error"], .text-red-500, .text-error',
        )
        .allTextContents()
        .catch(() => []);

      page.off("request", onReq);

      throw new Error(
        [
          "Timed out waiting for POST /api/trips/*/flights.",
          `Seen flight POSTs: ${seenFlightPosts.length ? "\n- " + seenFlightPosts.join("\n- ") : "(none)"}`,
          `Visible form errors: ${visibleErrors.length ? visibleErrors.join(" | ") : "(none found)"}`,
          `Screenshot: ${screenshotPath}`,
        ].join("\n"),
      );
    }

    // Clean up listener
    page.off("request", onReq);

    // Fail loudly if backend rejected it
    if (createResp.status() >= 400) {
      const body = await createResp.text().catch(() => "<no body>");
      throw new Error(
        `Create flight failed: ${createResp.status()} ${createResp.url()}\n${body}`,
      );
    }

    // If your UI closes the modal on success, wait for it (optional but nice).
    await expect(dialogContent(page))
      .toHaveCount(0, { timeout: 20_000 })
      .catch(() => {});

    // Finally: assert the created flight shows up.
    // Be tolerant about spaces/casing (LH123 vs LH 123, etc.)
    await expect(page.getByText(/LH\s*123/i)).toBeVisible({ timeout: 20_000 });
  });

  test("multi-leg outbound: add leg adds segment; remove removes it", async ({
    page,
  }) => {
    await openTrip(page);
    const dialog = await openAddFlightModal(page);

    await selectAirline(page, dialog, "Air France");
    await dialog.getByLabel(/flight number/i).fill("AF321");

    // Prefer your testid if you added it on the button
    const addLegBtn = dialog
      .getByTestId("add-leg-btn")
      .or(dialog.getByRole("button", { name: /add leg/i }).first());

    await expect(addLegBtn).toBeVisible({ timeout: 20_000 });
    await addLegBtn.click();

    const cards = segmentCards(dialog);
    await expect(cards).toHaveCount(2, { timeout: 20_000 });

    const today = new Date().toISOString().split("T")[0];

    await fillSegment(cards.nth(0), {
      from: "CDG",
      to: "AMS",
      depDate: today,
      depTime: "08:00",
      arrDate: today,
      arrTime: "09:00",
    });

    await fillSegment(cards.nth(1), {
      from: "AMS",
      to: "SIN",
      depDate: today,
      depTime: "11:00",
      arrDate: today,
      arrTime: "20:00",
    });

    // Prefer your remove testid if you added it
    const removeBtn = cards
      .nth(1)
      .getByTestId("remove-segment")
      .or(cards.nth(1).locator("button").first());

    await removeBtn.click();
    await expect(segmentCards(dialog)).toHaveCount(1, { timeout: 20_000 });

    await closeModal(page);
  });

  test("round trip: enabling adds return segment; invalid arrival shows error", async ({
    page,
  }) => {
    await openTrip(page);
    const dialog = await openAddFlightModal(page);

    await selectAirline(page, dialog, "Delta");
    await dialog.getByLabel(/flight number/i).fill("DL777");

    await dialog.getByLabel(/round trip/i).check();
    await expect(dialog.getByText(/return segments/i)).toBeVisible({
      timeout: 20_000,
    });

    const cards = segmentCards(dialog);
    await expect(cards).toHaveCount(2, { timeout: 20_000 });

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    await fillSegment(cards.nth(0), {
      from: "ATL",
      to: "LAX",
      depDate: today,
      depTime: "08:00",
      arrDate: today,
      arrTime: "11:00",
    });

    await fillSegment(cards.nth(1), {
      from: "LAX",
      to: "ATL",
      depDate: tomorrow,
      depTime: "15:00",
      arrDate: tomorrow,
      arrTime: "14:00", // invalid
    });

    await dialog.getByRole("button", { name: /^add flight$/i }).click();
    await expect(
      dialog.getByText(/arrival cannot be before departure/i),
    ).toBeVisible({
      timeout: 20_000,
    });

    // fix and submit
    const returnTimes = cards.nth(1).locator('input[type="time"]');
    await returnTimes.nth(1).fill("18:00");

    await dialog.getByRole("button", { name: /^add flight$/i }).click();
    await expect(page.getByText("DL777")).toBeVisible({ timeout: 20_000 });
  });
});
