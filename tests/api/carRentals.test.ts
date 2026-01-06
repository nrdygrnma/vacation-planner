import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

const BASE_URL = "http://localhost:3000";

describe("Car Rentals API", () => {
  let testTripId: string;
  let testRentalId: string;
  let currencyId: string;
  let carTypeId: string;

  beforeAll(async () => {
    // Get available currencies
    const currenciesResponse = await fetch(`${BASE_URL}/api/currencies`);
    const currencies = await currenciesResponse.json();
    currencyId = currencies[0].id;

    // Get car types
    const carTypesResponse = await fetch(`${BASE_URL}/api/car-types`);
    const carTypes = await carTypesResponse.json();
    if (carTypes.length > 0) {
      carTypeId = carTypes[0].id;
    } else {
      // If no car types, we might have an issue, but let's assume seed will run
    }

    // Create a test trip
    const tripResponse = await fetch(`${BASE_URL}/api/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Trip for Car Rentals",
        startDate: "2024-12-01T00:00:00.000Z",
        endDate: "2024-12-10T00:00:00.000Z",
        currencyId: currencyId,
      }),
    });
    const trip = await tripResponse.json();
    testTripId = trip.id;
  });

  afterAll(async () => {
    if (testTripId) {
      await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
        method: "DELETE",
      });
    }
  });

  describe("GET /api/trips/:tripId/car-rentals", () => {
    it("should return list of car rentals for a trip", async () => {
      const response = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/car-rentals`,
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("POST /api/trips/:tripId/car-rentals", () => {
    it("should create a new car rental", async () => {
      const rentalData = {
        company: "Test Rental",
        carTypeId: carTypeId,
        pickupLocation: "Airport",
        dropOffLocation: "City",
        pickupDate: "2024-12-01T10:00:00.000Z",
        dropOffDate: "2024-12-05T14:00:00.000Z",
        baseRate: 250,
        currencyId: currencyId,
      };

      const response = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/car-rentals`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rentalData),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data.provider).toBe("Test Rental");
      testRentalId = data.id;
    });
  });

  describe("PUT /api/trips/:tripId/car-rentals/:rentalId", () => {
    it("should update car rental", async () => {
      const response = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/car-rentals/${testRentalId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: "Updated Rental" }),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.provider).toBe("Updated Rental");
    });
  });

  describe("DELETE /api/trips/:tripId/car-rentals/:rentalId", () => {
    it("should delete car rental", async () => {
      const response = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/car-rentals/${testRentalId}`,
        {
          method: "DELETE",
        },
      );
      expect(response.status).toBe(200);
    });
  });
});
