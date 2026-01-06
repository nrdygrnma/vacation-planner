/**
 * Test Utilities for API Tests
 *
 * Common helper functions and utilities for API testing
 */

export const BASE_URL = 'http://localhost:3000';

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  people: number;
  totalCostEUR: string | number;
  currencyId: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Flight {
  id: string;
  airline: string;
  fromAirport: string;
  toAirport: string;
  departureDate: string;
  arrivalDate: string;
  flightNumber: string;
  travelClass: string;
  baseFare: string | number;
  totalCostEUR: string | number;
  currencyId: string;
  tripId: string;
  stops: number;
  isRoundTrip?: boolean;
  returnDepartureDate?: string;
  returnArrivalDate?: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
}

export interface Airline {
  code: string;
  name: string;
}

/**
 * Fetches data from an API endpoint and returns typed response
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
}

/**
 * Creates a trip for testing
 */
export async function createTestTrip(
  currencyId: string,
  overrides?: Partial<any>
): Promise<Trip> {
  const defaultTrip = {
    title: `Test Trip ${Date.now()}`,
    startDate: '2024-12-01T00:00:00.000Z',
    endDate: '2024-12-10T00:00:00.000Z',
    people: 2,
    totalCostEUR: 1000,
    currencyId,
    ...overrides,
  };

  const response = await fetch(`${BASE_URL}/api/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaultTrip),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test trip: ${response.status}`);
  }

  return await response.json();
}

/**
 * Deletes a trip
 */
export async function deleteTestTrip(tripId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/trips/${tripId}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 404) {
    console.warn(`Failed to delete test trip ${tripId}: ${response.status}`);
  }
}

/**
 * Creates a flight for testing
 */
export async function createTestFlight(
  tripId: string,
  currencyId: string,
  overrides?: Partial<any>
): Promise<Flight> {
  const defaultFlight = {
    airline: 'Test Airlines',
    fromAirport: 'JFK',
    toAirport: 'LAX',
    departureDate: '2024-12-05T10:00:00.000Z',
    arrivalDate: '2024-12-05T13:00:00.000Z',
    flightNumber: `TEST${Date.now()}`,
    travelClass: 'Economy',
    baseFare: 500,
    currencyId,
    totalCostEUR: 500,
    stops: 0,
    ...overrides,
  };

  const response = await fetch(`${BASE_URL}/api/trips/${tripId}/flights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaultFlight),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test flight: ${response.status}`);
  }

  return await response.json();
}

/**
 * Deletes a flight
 */
export async function deleteTestFlight(tripId: string, flightId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/trips/${tripId}/flights/${flightId}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 404) {
    console.warn(`Failed to delete test flight ${flightId}: ${response.status}`);
  }
}

/**
 * Gets the first available currency
 */
export async function getFirstCurrency(): Promise<Currency> {
  const response = await fetch(`${BASE_URL}/api/currencies`);

  if (!response.ok) {
    throw new Error(`Failed to fetch currencies: ${response.status}`);
  }

  const currencies = await response.json();

  if (!currencies || currencies.length === 0) {
    throw new Error('No currencies available in the database');
  }

  return currencies[0];
}

/**
 * Gets all available currencies
 */
export async function getCurrencies(): Promise<Currency[]> {
  const response = await fetch(`${BASE_URL}/api/currencies`);

  if (!response.ok) {
    throw new Error(`Failed to fetch currencies: ${response.status}`);
  }

  return await response.json();
}

/**
 * Waits for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random string for unique test data
 */
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a future date
 */
export function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}

/**
 * Asserts that a response has the expected status
 */
export function expectStatus(response: Response, expectedStatus: number): void {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status}`
    );
  }
}

/**
 * Cleans up multiple trips
 */
export async function cleanupTrips(tripIds: string[]): Promise<void> {
  await Promise.all(tripIds.map(id => deleteTestTrip(id)));
}

/**
 * Retries an async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delayMs * attempt);
      }
    }
  }

  throw lastError!;
}

/**
 * Validates that an object has all required properties
 */
export function hasRequiredFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): boolean {
  return fields.every(field => field in obj && obj[field] !== undefined);
}

/**
 * Creates a test context with automatic cleanup
 */
export class TestContext {
  private tripsToCleanup: string[] = [];
  private currencyIdCache?: string;

  async getCurrencyId(): Promise<string> {
    if (!this.currencyIdCache) {
      const currency = await getFirstCurrency();
      this.currencyIdCache = currency.id;
    }
    return this.currencyIdCache;
  }

  async createTrip(overrides?: Partial<any>): Promise<Trip> {
    const currencyId = await this.getCurrencyId();
    const trip = await createTestTrip(currencyId, overrides);
    this.tripsToCleanup.push(trip.id);
    return trip;
  }

  async createFlight(tripId: string, overrides?: Partial<any>): Promise<Flight> {
    const currencyId = await this.getCurrencyId();
    return await createTestFlight(tripId, currencyId, overrides);
  }

  async cleanup(): Promise<void> {
    await cleanupTrips(this.tripsToCleanup);
    this.tripsToCleanup = [];
  }
}

/**
 * Validates ISO date string format
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date.toISOString() === dateString;
}

/**
 * Compares two dates (ignoring milliseconds)
 */
export function datesEqual(date1: string | Date, date2: string | Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(d1.getTime() - d2.getTime()) < 1000;
}

/**
 * Validates that array is sorted
 */
export function isSorted<T>(
  array: T[],
  compareFn: (a: T, b: T) => number
): boolean {
  for (let i = 1; i < array.length; i++) {
    if (compareFn(array[i - 1], array[i]) > 0) {
      return false;
    }
  }
  return true;
}

/**
 * Extracts error message from response
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.statusMessage || data.message || 'Unknown error';
  } catch {
    return `HTTP ${response.status}`;
  }
}
