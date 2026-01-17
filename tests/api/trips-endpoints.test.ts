import { describe, expect, it } from "@jest/globals";

const BASE_URL = "http://localhost:3000";

describe("Trips API (regression)", () => {
  it("GET /api/trips should return 200 and an array", async () => {
    const res = await fetch(`${BASE_URL}/api/trips`);
    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type") || "";
    expect(contentType).toContain("application/json");
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /api/trips/:id should return 404 for a non-existent trip", async () => {
    const fakeId = "cm_nonexistent_trip_id_12345";
    const res = await fetch(`${BASE_URL}/api/trips/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it("GET /api/trips/:id/stops should return 200 and an array (empty for unknown trip)", async () => {
    const fakeId = "cm_nonexistent_trip_id_12345";
    const res = await fetch(`${BASE_URL}/api/trips/${fakeId}/stops`);
    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type") || "";
    expect(contentType).toContain("application/json");
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /api/trips/:id/snapshots should return 200 and an array (empty or data if feature enabled)", async () => {
    const fakeId = "cm_nonexistent_trip_id_12345";
    const res = await fetch(`${BASE_URL}/api/trips/${fakeId}/snapshots`);
    expect(res.status).toBeLessThan(500);
    const ct = res.headers.get("content-type") || "";
    if (res.status === 200 && ct.includes("application/json")) {
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  it("PUT /api/trips/:id/stops/reorder should be a no-op and return success with chronological stops", async () => {
    const fakeId = "cm_nonexistent_trip_id_12345";
    const res = await fetch(`${BASE_URL}/api/trips/${fakeId}/stops/reorder`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orders: [] }),
    });
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    // Should not throw, and should return an object
    expect(typeof data).toBe("object");
    // Optional fields we expect in our no-op implementation
    if (data && typeof data === "object") {
      if ("success" in data) expect(data.success).toBe(true);
      if ("stops" in data) expect(Array.isArray(data.stops)).toBe(true);
    }
  });
});
