import { describe, expect, it } from "@jest/globals";

const BASE_URL = "http://localhost:3000";

/**
 * Smoke Tests
 *
 * Quick sanity checks to verify the API is up and basic endpoints are working.
 * These tests should run fast and catch major issues.
 */
describe("API Smoke Tests", () => {
  describe("Server Health", () => {
    it("should respond to API requests", async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      expect(response.status).toBeLessThan(500);
    });

    it("should return JSON responses", async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const contentType = response.headers.get("content-type");
      expect(contentType).toContain("application/json");
    });
  });

  describe("Critical Endpoints", () => {
    it("GET /api/currencies should work", async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it("GET /api/trips should work", async () => {
      const response = await fetch(`${BASE_URL}/api/trips`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("GET /api/airlines should work", async () => {
      const response = await fetch(`${BASE_URL}/api/airlines`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("Database Connectivity", () => {
    it("should be able to query currencies", async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const currencies = await response.json();

      expect(currencies.length).toBeGreaterThan(0);
      expect(currencies[0]).toHaveProperty("id");
      expect(currencies[0]).toHaveProperty("name");
      expect(currencies[0]).toHaveProperty("symbol");
    });
  });

  describe("Basic CRUD", () => {
    let testTripId: string;
    let currencyId: string;

    it("should create a resource", async () => {
      // Get currency first
      const currenciesResponse = await fetch(`${BASE_URL}/api/currencies`);
      const currencies = await currenciesResponse.json();
      currencyId = currencies[0].id;

      // Create trip
      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Smoke Test Trip",
          startDate: "2024-12-01T00:00:00.000Z",
          endDate: "2024-12-10T00:00:00.000Z",
          currencyId: currencyId,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("id");
      testTripId = data.id;
    });

    it("should read the created resource", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.id).toBe(testTripId);
      expect(data.title).toBe("Smoke Test Trip");
    });

    it("should update the resource", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Updated Smoke Test" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.title).toBe("Updated Smoke Test");
    });

    it("should delete the resource", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await fetch(`${BASE_URL}/api/trips/${testTripId}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent resources", async () => {
      const response = await fetch(`${BASE_URL}/api/trips/non-existent-id`);
      expect(response.status).toBe(404);
    });

    it("should return 400 for invalid data", async () => {
      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "" }), // Invalid empty name
      });

      expect(response.status).toBe(400);
    });
  });
});
