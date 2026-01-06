import { describe, it, expect } from '@jest/globals';

const BASE_URL = 'http://localhost:3000';

describe('Airlines API', () => {
  describe('GET /api/airlines', () => {
    it('should return list of airlines', async () => {
      const response = await fetch(`${BASE_URL}/api/airlines`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return airlines with code and name', async () => {
      const response = await fetch(`${BASE_URL}/api/airlines`);
      const data = await response.json();

      expect(data.length).toBeGreaterThan(0);

      const airline = data[0];
      expect(airline).toHaveProperty('code');
      expect(airline).toHaveProperty('name');
      expect(typeof airline.code).toBe('string');
      expect(typeof airline.name).toBe('string');
    });

    it('should return airlines sorted alphabetically by name', async () => {
      const response = await fetch(`${BASE_URL}/api/airlines`);
      const data = await response.json();

      if (data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i - 1].name.localeCompare(data[i].name)).toBeLessThanOrEqual(0);
        }
      }
    });

    it('should limit results to default 50', async () => {
      const response = await fetch(`${BASE_URL}/api/airlines`);
      const data = await response.json();

      expect(data.length).toBeLessThanOrEqual(50);
    });

    it('should filter airlines by search query (name)', async () => {
      const searchTerm = 'American';
      const response = await fetch(`${BASE_URL}/api/airlines?search=${searchTerm}`);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const matches = data.every((airline: { name: string; code: string }) =>
          airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airline.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        expect(matches).toBe(true);
      }
    });

    it('should filter airlines by search query (code)', async () => {
      const searchTerm = 'AA';
      const response = await fetch(`${BASE_URL}/api/airlines?search=${searchTerm}`);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const matches = data.every((airline: { name: string; code: string }) =>
          airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airline.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        expect(matches).toBe(true);
      }
    });

    it('should return empty array for non-matching search', async () => {
      const searchTerm = 'xyz123nonexistent';
      const response = await fetch(`${BASE_URL}/api/airlines?search=${searchTerm}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('should respect custom limit parameter', async () => {
      const limit = 10;
      const response = await fetch(`${BASE_URL}/api/airlines?limit=${limit}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBeLessThanOrEqual(limit);
    });

    it('should handle limit=5', async () => {
      const limit = 5;
      const response = await fetch(`${BASE_URL}/api/airlines?limit=${limit}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBeLessThanOrEqual(limit);
    });

    it('should handle limit=100', async () => {
      const limit = 100;
      const response = await fetch(`${BASE_URL}/api/airlines?limit=${limit}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBeLessThanOrEqual(limit);
    });

    it('should handle search with whitespace', async () => {
      const searchTerm = '  delta  ';
      const response = await fetch(`${BASE_URL}/api/airlines?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should combine search and limit parameters', async () => {
      const searchTerm = 'air';
      const limit = 5;
      const response = await fetch(`${BASE_URL}/api/airlines?search=${searchTerm}&limit=${limit}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeLessThanOrEqual(limit);

      if (data.length > 0) {
        const matches = data.every((airline: { name: string; code: string }) =>
          airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airline.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        expect(matches).toBe(true);
      }
    });

    it('should handle case-insensitive search', async () => {
      const searchTermLower = 'united';
      const searchTermUpper = 'UNITED';

      const responseLower = await fetch(`${BASE_URL}/api/airlines?search=${searchTermLower}`);
      const dataLower = await responseLower.json();

      const responseUpper = await fetch(`${BASE_URL}/api/airlines?search=${searchTermUpper}`);
      const dataUpper = await responseUpper.json();

      expect(dataLower.length).toBe(dataUpper.length);
    });

    it('should handle invalid limit gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/airlines?limit=invalid`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      // Should fallback to default limit of 50
      expect(data.length).toBeLessThanOrEqual(50);
    });

    it('should handle negative limit gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/airlines?limit=-10`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      // Should fallback to default limit of 50
      expect(data.length).toBeLessThanOrEqual(50);
    });

    it('should handle zero limit gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/airlines?limit=0`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      // Should fallback to default limit of 50
      expect(data.length).toBeLessThanOrEqual(50);
    });

    it('should handle empty search parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/airlines?search=`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });
});
