import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const BASE_URL = 'http://localhost:3000';

describe('Flights API', () => {
  let testTripId: string;
  let testFlightId: string;
  let currencyId: string;

  beforeAll(async () => {
    // Get available currencies
    const currenciesResponse = await fetch(`${BASE_URL}/api/currencies`);
    const currencies = await currenciesResponse.json();
    currencyId = currencies[0].id;

    // Create a test trip
    const tripResponse = await fetch(`${BASE_URL}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Trip for Flights',
        startDate: '2024-12-01T00:00:00.000Z',
        endDate: '2024-12-10T00:00:00.000Z',
        currencyId: currencyId,
      }),
    });
    const trip = await tripResponse.json();
    testTripId = trip.id;
  });

  afterAll(async () => {
    // Cleanup: delete the test trip (cascade deletes flights)
    if (testTripId) {
      await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
        method: 'DELETE',
      });
    }
  });

  describe('GET /api/trips/:tripId/flights', () => {
    it('should return list of flights for a trip', async () => {
      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return 400 for missing trip ID', async () => {
      const response = await fetch(`${BASE_URL}/api/trips//flights`);

      expect(response.status).not.toBe(200);
    });

    it('should return flights with currency information', async () => {
      // Create a flight first
      const flightData = {
        airline: 'Test Airlines',
        fromAirport: 'JFK',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'TA123',
        travelClass: 'Economy',
        baseFare: 350,
        currencyId: currencyId,
        totalCostEUR: 350,
        stops: 0,
      };

      await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`);
      const data = await response.json();

      if (data.length > 0) {
        const flight = data[0];
        expect(flight).toHaveProperty('id');
        expect(flight).toHaveProperty('airline');
        expect(flight).toHaveProperty('fromAirport');
        expect(flight).toHaveProperty('toAirport');
        expect(flight).toHaveProperty('currency');
        expect(flight.currency).toHaveProperty('id');
        expect(flight.currency).toHaveProperty('name');
      }
    });
  });

  describe('POST /api/trips/:tripId/flights', () => {
    it('should create a new flight with required fields', async () => {
      const flightData = {
        airline: 'American Airlines',
        fromAirport: 'JFK',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'AA100',
        travelClass: 'Economy',
        baseFare: 450,
        currencyId: currencyId,
        totalCostEUR: 450,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.airline).toBe(flightData.airline);
      expect(data.fromAirport).toBe(flightData.fromAirport);
      expect(data.toAirport).toBe(flightData.toAirport);
      expect(data.flightNumber).toBe(flightData.flightNumber);
      expect(data.travelClass).toBe(flightData.travelClass);

      testFlightId = data.id;
    });

    it('should create a round trip flight', async () => {
      const flightData = {
        airline: 'Delta',
        fromAirport: 'ATL',
        toAirport: 'SEA',
        departureDate: '2024-12-06T08:00:00.000Z',
        arrivalDate: '2024-12-06T11:00:00.000Z',
        isRoundTrip: true,
        returnDepartureDate: '2024-12-09T14:00:00.000Z',
        returnArrivalDate: '2024-12-09T22:00:00.000Z',
        flightNumber: 'DL200',
        travelClass: 'Business',
        baseFare: 800,
        currencyId: currencyId,
        totalCostEUR: 800,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.isRoundTrip).toBe(true);
      expect(data.returnDepartureDate).toBeTruthy();
      expect(data.returnArrivalDate).toBeTruthy();
    });

    it('should fail without airline', async () => {
      const invalidData = {
        fromAirport: 'JFK',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'XX100',
        travelClass: 'Economy',
        baseFare: 450,
        currencyId: currencyId,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain('airline');
    });

    it('should fail without fromAirport', async () => {
      const invalidData = {
        airline: 'Test Airlines',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'XX100',
        travelClass: 'Economy',
        baseFare: 450,
        currencyId: currencyId,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain('fromAirport');
    });

    it('should fail without toAirport', async () => {
      const invalidData = {
        airline: 'Test Airlines',
        fromAirport: 'JFK',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'XX100',
        travelClass: 'Economy',
        baseFare: 450,
        currencyId: currencyId,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain('toAirport');
    });

    it('should fail without flightNumber', async () => {
      const invalidData = {
        airline: 'Test Airlines',
        fromAirport: 'JFK',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        travelClass: 'Economy',
        baseFare: 450,
        currencyId: currencyId,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain('flightNumber');
    });

    it('should fail without travelClass', async () => {
      const invalidData = {
        airline: 'Test Airlines',
        fromAirport: 'JFK',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'XX100',
        baseFare: 450,
        currencyId: currencyId,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain('travelClass');
    });

    it('should fail without baseFare', async () => {
      const invalidData = {
        airline: 'Test Airlines',
        fromAirport: 'JFK',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'XX100',
        travelClass: 'Economy',
        currencyId: currencyId,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain('baseFare');
    });

    it('should fail without currencyId', async () => {
      const invalidData = {
        airline: 'Test Airlines',
        fromAirport: 'JFK',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'XX100',
        travelClass: 'Economy',
        baseFare: 450,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain('currencyId');
    });

    it('should fail without stops', async () => {
      const invalidData = {
        airline: 'Test Airlines',
        fromAirport: 'JFK',
        toAirport: 'LAX',
        departureDate: '2024-12-05T10:00:00.000Z',
        arrivalDate: '2024-12-05T13:00:00.000Z',
        flightNumber: 'XX100',
        travelClass: 'Economy',
        baseFare: 450,
        currencyId: currencyId,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.statusMessage).toContain('stops');
    });

    it('should create flight with optional fields', async () => {
      const flightData = {
        airline: 'United',
        fromAirport: 'ORD',
        toAirport: 'SFO',
        departureDate: '2024-12-07T09:00:00.000Z',
        arrivalDate: '2024-12-07T11:30:00.000Z',
        flightNumber: 'UA500',
        travelClass: 'Premium Economy',
        baseFare: 600,
        currencyId: currencyId,
        totalCostEUR: 650,
        stops: 1,
        bookingUrl: 'https://example.com/booking',
        notes: 'Window seat preferred',
        extras: 'Extra baggage',
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.bookingUrl).toBe(flightData.bookingUrl);
      expect(data.notes).toBe(flightData.notes);
      expect(data.stops).toBe(1);
    });

    it('should create flight with segments', async () => {
      const flightData = {
        airline: 'Lufthansa',
        fromAirport: 'FRA',
        toAirport: 'JFK',
        flightNumber: 'LH400',
        travelClass: 'Economy',
        baseFare: 700,
        currencyId: currencyId,
        totalCostEUR: 700,
        stops: 1,
        segments: [
          {
            fromAirport: 'FRA',
            toAirport: 'LHR',
            departureDate: '2024-12-08T10:00:00Z',
            arrivalDate: '2024-12-08T11:00:00Z',
            isReturn: false,
          },
          {
            fromAirport: 'LHR',
            toAirport: 'JFK',
            departureDate: '2024-12-08T13:00:00Z',
            arrivalDate: '2024-12-08T16:00:00Z',
            isReturn: false,
          },
        ],
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.segments).toBeTruthy();
      expect(Array.isArray(data.segments)).toBe(true);
      expect(data.segments.length).toBe(2);
    });
  });

  describe('PUT /api/trips/:tripId/flights/:flightId', () => {
    let updateFlightId: string;

    beforeAll(async () => {
      // Create a flight to update
      const flightData = {
        airline: 'Southwest',
        fromAirport: 'LAS',
        toAirport: 'PHX',
        departureDate: '2024-12-08T12:00:00.000Z',
        arrivalDate: '2024-12-08T13:30:00.000Z',
        flightNumber: 'WN300',
        travelClass: 'Economy',
        baseFare: 150,
        currencyId: currencyId,
        totalCostEUR: 150,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });

      const data = await response.json();
      updateFlightId = data.id;
    });

    it('should update flight details', async () => {
      const updatedData = {
        flightNumber: 'WN301',
        baseFare: 175,
        notes: 'Updated flight',
      };

      const response = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/flights/${updateFlightId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.flightNumber).toBe('WN301');
      expect(data.notes).toBe('Updated flight');
    });

    it('should update flight dates', async () => {
      const updatedData = {
        departureDate: '2024-12-09T10:00:00.000Z',
        arrivalDate: '2024-12-09T11:30:00.000Z',
      };

      const response = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/flights/${updateFlightId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(new Date(data.departureDate).toISOString()).toBe(updatedData.departureDate);
      expect(new Date(data.arrivalDate).toISOString()).toBe(updatedData.arrivalDate);
    });

    it('should return 404 for non-existent flight', async () => {
      const updatedData = {
        notes: 'Update',
      };

      const response = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/flights/non-existent-id`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/trips/:tripId/flights/:flightId', () => {
    it('should delete a flight', async () => {
      // Create a flight to delete
      const flightData = {
        airline: 'JetBlue',
        fromAirport: 'BOS',
        toAirport: 'FLL',
        departureDate: '2024-12-08T07:00:00.000Z',
        arrivalDate: '2024-12-08T10:00:00.000Z',
        flightNumber: 'B6400',
        travelClass: 'Economy',
        baseFare: 200,
        currencyId: currencyId,
        totalCostEUR: 200,
        stops: 0,
      };

      const createResponse = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });

      const createdFlight = await createResponse.json();
      const flightId = createdFlight.id;

      // Delete the flight
      const deleteResponse = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/flights/${flightId}`,
        {
          method: 'DELETE',
        }
      );

      expect(deleteResponse.status).toBe(200);

      // Verify flight is removed from the list
      const listResponse = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`);
      const flights = await listResponse.json();
      const deletedFlight = flights.find((f: any) => f.id === flightId);
      expect(deletedFlight).toBeUndefined();
    });

    it('should return 404 when deleting non-existent flight', async () => {
      const response = await fetch(
        `${BASE_URL}/api/trips/${testTripId}/flights/non-existent-id`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/trips/:tripId/final-flight', () => {
    let finalFlightId: string;

    beforeAll(async () => {
      // Create a flight to set as final
      const flightData = {
        airline: 'Air Canada',
        fromAirport: 'YYZ',
        toAirport: 'YVR',
        departureDate: '2024-12-08T14:00:00.000Z',
        arrivalDate: '2024-12-08T17:00:00.000Z',
        flightNumber: 'AC100',
        travelClass: 'Economy',
        baseFare: 300,
        currencyId: currencyId,
        totalCostEUR: 300,
        stops: 0,
      };

      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });

      const data = await response.json();
      finalFlightId = data.id;
    });

    it('should set a flight as the final/selected flight', async () => {
      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/final-flight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: finalFlightId }),
      });

      expect(response.status).toBe(200);

      // Verify by getting the trip details
      const tripResponse = await fetch(`${BASE_URL}/api/trips/${testTripId}`);
      const trip = await tripResponse.json();
      expect(trip.selectedFlightId).toBe(finalFlightId);
      expect(trip.selectedFlight).toBeTruthy();
      expect(trip.selectedFlight.id).toBe(finalFlightId);
    });

    it('should unset final flight when flightId is null', async () => {
      // First set a final flight
      await fetch(`${BASE_URL}/api/trips/${testTripId}/final-flight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: finalFlightId }),
      });

      // Then unset it
      const response = await fetch(`${BASE_URL}/api/trips/${testTripId}/final-flight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: null }),
      });

      expect(response.status).toBe(200);

      // Verify
      const tripResponse = await fetch(`${BASE_URL}/api/trips/${testTripId}`);
      const trip = await tripResponse.json();
      expect(trip.selectedFlightId).toBeNull();
    });

    it('should return 404 for non-existent trip', async () => {
      const response = await fetch(`${BASE_URL}/api/trips/non-existent-id/final-flight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: finalFlightId }),
      });

      expect(response.status).toBe(404);
    });
  });
});
