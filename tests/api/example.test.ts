import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  TestContext,
  BASE_URL,
  hasRequiredFields,
  isSorted,
  futureDate,
} from './helpers/testUtils';

/**
 * Example Test Suite
 *
 * This file demonstrates how to use the test utilities for writing API tests.
 * You can use this as a template for creating new test files.
 */
describe('Example API Tests Using Utilities', () => {
  const ctx = new TestContext();

  afterAll(async () => {
    // Automatic cleanup of all created resources
    await ctx.cleanup();
  });

  describe('Creating Trips with Test Context', () => {
    it('should create a trip using test context helper', async () => {
      const trip = await ctx.createTrip({
        title: 'Example Trip to Tokyo',
        startDate: futureDate(30),
        endDate: futureDate(40),
        people: 3,
      });

      expect(trip).toHaveProperty('id');
      expect(trip.title).toBe('Example Trip to Tokyo');
      expect(trip.people).toBe(3);
    });

    it('should validate required fields on trip', async () => {
      const trip = await ctx.createTrip();

      const requiredFields = ['id', 'title', 'startDate', 'endDate', 'currencyId'];
      const hasAllFields = hasRequiredFields(trip, requiredFields);

      expect(hasAllFields).toBe(true);
    });

    it('should create multiple trips efficiently', async () => {
      const trip1 = await ctx.createTrip({ title: 'Trip 1' });
      const trip2 = await ctx.createTrip({ title: 'Trip 2' });
      const trip3 = await ctx.createTrip({ title: 'Trip 3' });

      expect(trip1.id).not.toBe(trip2.id);
      expect(trip2.id).not.toBe(trip3.id);
      // All will be cleaned up automatically
    });
  });

  describe('Creating Flights with Test Context', () => {
    let tripId: string;

    beforeAll(async () => {
      const trip = await ctx.createTrip({ title: 'Flight Test Trip' });
      tripId = trip.id;
    });

    it('should create a flight using test context helper', async () => {
      const flight = await ctx.createFlight(tripId, {
        airline: 'Example Airways',
        fromAirport: 'SFO',
        toAirport: 'NRT',
        flightNumber: 'EX123',
      });

      expect(flight).toHaveProperty('id');
      expect(flight.airline).toBe('Example Airways');
      expect(flight.fromAirport).toBe('SFO');
      expect(flight.toAirport).toBe('NRT');
    });

    it('should create round-trip flight', async () => {
      const flight = await ctx.createFlight(tripId, {
        isRoundTrip: true,
        returnDepartureDate: futureDate(10),
        returnArrivalDate: futureDate(11),
      });

      expect(flight.isRoundTrip).toBe(true);
      expect(flight.returnDepartureDate).toBeTruthy();
      expect(flight.returnArrivalDate).toBeTruthy();
    });
  });

  describe('Validating API Responses', () => {
    it('should verify trips are sorted by date', async () => {
      // Create trips with different dates
      await ctx.createTrip({ startDate: futureDate(10) });
      await ctx.createTrip({ startDate: futureDate(5) });
      await ctx.createTrip({ startDate: futureDate(15) });

      const response = await fetch(`${BASE_URL}/api/trips`);
      const trips = await response.json();

      const sorted = isSorted(trips, (a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });

      expect(sorted).toBe(true);
    });

    it('should verify currency structure', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const currencies = await response.json();

      expect(currencies.length).toBeGreaterThan(0);

      currencies.forEach((currency: any) => {
        expect(hasRequiredFields(currency, ['id', 'name', 'symbol'])).toBe(true);
        expect(typeof currency.id).toBe('string');
        expect(typeof currency.name).toBe('string');
        expect(typeof currency.symbol).toBe('string');
      });
    });
  });

  describe('Error Handling Examples', () => {
    it('should handle validation errors gracefully', async () => {
      const invalidTrip = {
        // Missing required fields
        title: '',
      };

      const response = await fetch(`${BASE_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTrip),
      });

      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData).toHaveProperty('statusMessage');
      expect(errorData.statusMessage).toContain('required');
    });

    it('should handle 404 errors for non-existent resources', async () => {
      const response = await fetch(`${BASE_URL}/api/trips/non-existent-id`);

      expect(response.status).toBe(404);

      const errorData = await response.json();
      expect(errorData.statusMessage).toContain('not found');
    });
  });

  describe('Update and Delete Operations', () => {
    it('should update trip and verify changes', async () => {
      const trip = await ctx.createTrip({ title: 'Original Title' });

      const updateResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      expect(updateResponse.status).toBe(200);

      const updatedTrip = await updateResponse.json();
      expect(updatedTrip.title).toBe('Updated Title');
      expect(updatedTrip.id).toBe(trip.id);
    });

    it('should delete trip and verify deletion', async () => {
      const trip = await ctx.createTrip({ title: 'Trip to Delete' });

      const deleteResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(200);

      // Verify it's gone
      const getResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('Complex Scenarios', () => {
    it('should create a complete trip with flights', async () => {
      // Create trip
      const trip = await ctx.createTrip({
        title: 'Complete Tokyo Trip',
        startDate: futureDate(30),
        endDate: futureDate(37),
        people: 2,
      });

      // Add outbound flight
      const outboundFlight = await ctx.createFlight(trip.id, {
        airline: 'Japan Airlines',
        fromAirport: 'LAX',
        toAirport: 'NRT',
        departureDate: futureDate(30),
        arrivalDate: futureDate(31),
        flightNumber: 'JL062',
        travelClass: 'Economy',
        baseFare: 850,
        totalCostEUR: 850,
      });

      // Add return flight
      const returnFlight = await ctx.createFlight(trip.id, {
        airline: 'Japan Airlines',
        fromAirport: 'NRT',
        toAirport: 'LAX',
        departureDate: futureDate(37),
        arrivalDate: futureDate(37),
        flightNumber: 'JL061',
        travelClass: 'Economy',
        baseFare: 850,
        totalCostEUR: 850,
      });

      // Verify trip has flights
      const tripResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}`);
      const tripWithFlights = await tripResponse.json();

      expect(tripWithFlights.flights).toBeTruthy();
      expect(tripWithFlights.flights.length).toBeGreaterThanOrEqual(2);

      const flightIds = tripWithFlights.flights.map((f: any) => f.id);
      expect(flightIds).toContain(outboundFlight.id);
      expect(flightIds).toContain(returnFlight.id);
    });

    it('should set and unset final flight selection', async () => {
      const trip = await ctx.createTrip({ title: 'Trip with Flight Selection' });
      const flight = await ctx.createFlight(trip.id);

      // Set as final flight
      const setResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}/final-flight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: flight.id }),
      });

      expect(setResponse.status).toBe(200);

      // Verify it's set
      let tripResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}`);
      let tripData = await tripResponse.json();
      expect(tripData.selectedFlightId).toBe(flight.id);

      // Unset final flight
      const unsetResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}/final-flight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: null }),
      });

      expect(unsetResponse.status).toBe(200);

      // Verify it's unset
      tripResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}`);
      tripData = await tripResponse.json();
      expect(tripData.selectedFlightId).toBeNull();
    });
  });
});
