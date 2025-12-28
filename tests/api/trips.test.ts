import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

const BASE_URL = "http://localhost:3000";

describe("Trips API", () => {
  let createdTripId: string;
  let currencyId: string;

  beforeAll(async () => {
    // Get available currencies first
    const currenciesResponse = await fetch(`${BASE_URL}/api/currencies`);
    const currencies = await currenciesResponse.json();
    expect(currencies.length).toBeGreaterThan(0);
    currencyId = currencies[0].id;
  });

  afterAll(async () => {
    // Cleanup: delete the created trip
    if (createdTripId) {
      await fetch(`${BASE_URL}/api/trips/${createdTripId}`, {
        method: "DELETE",
      });
    }
  });

  describe("GET /api/trips", () => {
    it("should return list of trips", async () => {
      const response = await fetch(`${BASE_URL}/api/trips`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should return trips with currency information", async () => {
      const response = await fetch(`${BASE_URL}/api/trips`);
      const data = await response.json();

      if (data.length > 0) {
        const trip = data[0];
        expect(trip).toHaveProperty("id");
        expect(trip).toHaveProperty("title");
        expect(trip).toHaveProperty("startDate");
        expect(trip).toHaveProperty("endDate");
        expect(trip).toHaveProperty("currency");
        expect(trip.currency).toHaveProperty("id");
        expect(trip.currency).toHaveProperty("name");
        expect(trip.currency).toHaveProperty("symbol");
      }
    });

    it("should return trips ordered by start date", async () => {
      const response = await fetch(`${BASE_URL}/api/trips`);
      const data = await response.json();

      if (data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          const prevDate = new Date(data[i - 1].startDate);
          const currentDate = new Date(data[i].startDate);
          expect(prevDate.getTime()).toBeLessThanOrEqual(currentDate.getTime());
        }
      }
    });
  });

  describe("POST /api/trips", () => {
    it("should create a new trip with valid data", async () => {
      const newTrip = {
        title: "Test Trip to Paris",
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-06-10T00:00:00.000Z",
        people: 2,
        totalCostEUR: 1500,
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTrip),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data.title).toBe(newTrip.title);
      expect(data.people).toBe(newTrip.people);
      expect(data.currencyId).toBe(newTrip.currencyId);

      // Store for cleanup
      createdTripId = data.id;
    });

    it("should fail without name", async () => {
      const invalidTrip = {
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-06-10T00:00:00.000Z",
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidTrip),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain("Title is required");
    });

    it("should fail with empty name", async () => {
      const invalidTrip = {
        title: "   ",
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-06-10T00:00:00.000Z",
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidTrip),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain("Title is required");
    });

    it("should fail without start date", async () => {
      const invalidTrip = {
        title: "Test Trip",
        endDate: "2024-06-10T00:00:00.000Z",
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidTrip),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain("Start date is required");
    });

    it("should fail without end date", async () => {
      const invalidTrip = {
        title: "Test Trip",
        startDate: "2024-06-01T00:00:00.000Z",
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidTrip),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain("End date is required");
    });

    it("should fail without currency", async () => {
      const invalidTrip = {
        title: "Test Trip",
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-06-10T00:00:00.000Z",
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidTrip),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain("Currency is required");
    });

    it("should fail with invalid currency", async () => {
      const invalidTrip = {
        title: "Test Trip",
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-06-10T00:00:00.000Z",
        currencyId: "invalid-currency-id",
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidTrip),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain("Invalid currency");
    });

    it("should set default values for optional fields", async () => {
      const minimalTrip = {
        title: "Minimal Trip",
        startDate: "2024-07-01T00:00:00.000Z",
        endDate: "2024-07-05T00:00:00.000Z",
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(minimalTrip),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.people).toBe(1); // default value
      expect(data.totalCostEUR).toBe("0"); // default value
      expect(data.imageUrl).toBeNull(); // default value

      // Cleanup
      await fetch(`${BASE_URL}/api/trips/${data.id}`, {
        method: "DELETE",
      });
    });
  });

  describe("GET /api/trips/:tripId", () => {
    let testTripId: string;

    beforeAll(async () => {
      // Create a trip for testing
      const newTrip = {
        title: "Test Trip for Get",
        startDate: "2024-08-01T00:00:00.000Z",
        endDate: "2024-08-10T00:00:00.000Z",
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTrip),
      });

      const data = await response.json();
      testTripId = data.id;
    });

    afterAll(async () => {
      // Cleanup
      if (testTripId) {
        await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
          method: "DELETE",
        });
      }
    });

    it("should return trip details by ID", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.id).toBe(testTripId);
      expect(data).toHaveProperty("title");
      expect(data).toHaveProperty("currency");
      expect(data).toHaveProperty("flights");
      expect(data).toHaveProperty("carRentals");
      expect(data).toHaveProperty("tripStops");
    });

    it("should include related entities", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}`);
      const data = await response.json();

      expect(Array.isArray(data.flights)).toBe(true);
      expect(Array.isArray(data.carRentals)).toBe(true);
      expect(Array.isArray(data.tripStops)).toBe(true);
      expect(data.currency).toHaveProperty("id");
      expect(data.currency).toHaveProperty("name");
      expect(data.currency).toHaveProperty("symbol");
    });

    it("should return 404 for non-existent trip", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/non-existent-id`);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.statusMessage).toContain("Trip not found");
    });

    it("should return 400 for missing trip ID", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/ /`);

      // This should fail as there's no trip ID
      expect(response.status).not.toBe(200);
    });
  });

  describe("PUT /api/trips/:tripId", () => {
    let testTripId: string;

    beforeAll(async () => {
      // Create a trip for testing
      const newTrip = {
        title: "Original Trip Title",
        startDate: "2024-09-01T00:00:00.000Z",
        endDate: "2024-09-10T00:00:00.000Z",
        people: 1,
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTrip),
      });

      const data = await response.json();
      testTripId = data.id;
    });

    afterAll(async () => {
      // Cleanup
      if (testTripId) {
        await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
          method: "DELETE",
        });
      }
    });

    it("should update trip name", async () => {
      const updatedData = {
        title: "Updated Trip Title",
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.title).toBe("Updated Trip Title");
    });

    it("should update trip dates", async () => {
      const updatedData = {
        startDate: "2024-10-01T00:00:00.000Z",
        endDate: "2024-10-15T00:00:00.000Z",
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(new Date(data.startDate).toISOString()).toBe(
        updatedData.startDate,
      );
      expect(new Date(data.endDate).toISOString()).toBe(updatedData.endDate);
    });

    it("should update number of people", async () => {
      const updatedData = {
        people: 4,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.people).toBe(4);
    });

    it("should return 404 for non-existent trip", async () => {
      const updatedData = {
        title: "Updated Title",
      };

      const response = await fetch(`${BASE_URL}/api/trips/non-existent-id`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/trips/:tripId", () => {
    it("should delete a trip", async () => {
      // Create a trip to delete
      const newTrip = {
        title: "Trip to Delete",
        startDate: "2024-11-01T00:00:00.000Z",
        endDate: "2024-11-05T00:00:00.000Z",
        currencyId: currencyId,
      };

      const createResponse = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTrip),
      });

      const createdTrip = await createResponse.json();
      const tripId = createdTrip.id;

      // Delete the trip
      const deleteResponse = await fetch(`${BASE_URL}/api/trips/${tripId}`, {
        method: "DELETE",
      });

      expect(deleteResponse.status).toBe(200);

      // Verify trip is deleted
      const getResponse = await fetch(`${BASE_URL}/api/trips/${tripId}`);
      expect(getResponse.status).toBe(404);
    });

    it("should return 404 when deleting non-existent trip", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/non-existent-id`, {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
    });
  });
});
