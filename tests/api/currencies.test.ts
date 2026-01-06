import { describe, it, expect } from '@jest/globals';

const BASE_URL = 'http://localhost:3000';

describe('Currencies API', () => {
  describe('GET /api/currencies', () => {
    it('should return list of currencies', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return currencies with required fields', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const data = await response.json();

      expect(data.length).toBeGreaterThan(0);

      const currency = data[0];
      expect(currency).toHaveProperty('id');
      expect(currency).toHaveProperty('name');
      expect(currency).toHaveProperty('symbol');
      expect(typeof currency.id).toBe('string');
      expect(typeof currency.name).toBe('string');
      expect(typeof currency.symbol).toBe('string');
    });

    it('should have unique currency names', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const data = await response.json();

      const names = data.map((currency: { name: string }) => currency.name);
      const uniqueNames = new Set(names);

      expect(names.length).toBe(uniqueNames.size);
    });

    it('should have unique currency symbols', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const data = await response.json();

      const symbols = data.map((currency: { symbol: string }) => currency.symbol);
      const uniqueSymbols = new Set(symbols);

      expect(symbols.length).toBe(uniqueSymbols.size);
    });

    it('should include common currencies', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const data = await response.json();

      const currencyNames = data.map((currency: { name: string }) => currency.name);

      // Check for some common currencies
      const commonCurrencies = ['EUR', 'USD', 'GBP'];
      const hasCommonCurrencies = commonCurrencies.some(common =>
        currencyNames.some((name: string) => name.includes(common))
      );

      expect(hasCommonCurrencies).toBe(true);
    });

    it('should return non-empty strings for all fields', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const data = await response.json();

      data.forEach((currency: { id: string; name: string; symbol: string }) => {
        expect(currency.id.length).toBeGreaterThan(0);
        expect(currency.name.length).toBeGreaterThan(0);
        expect(currency.symbol.length).toBeGreaterThan(0);
      });
    });

    it('should return consistent data on multiple requests', async () => {
      const response1 = await fetch(`${BASE_URL}/api/currencies`);
      const data1 = await response1.json();

      const response2 = await fetch(`${BASE_URL}/api/currencies`);
      const data2 = await response2.json();

      expect(data1.length).toBe(data2.length);
      expect(JSON.stringify(data1)).toBe(JSON.stringify(data2));
    });

    it('should have valid currency symbols format', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);
      const data = await response.json();

      data.forEach((currency: { symbol: string }) => {
        // Currency symbols should be short (1-3 characters typically)
        expect(currency.symbol.length).toBeLessThanOrEqual(5);
        // Should not be empty
        expect(currency.symbol.trim().length).toBeGreaterThan(0);
      });
    });

    it('should return proper content-type header', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`);

      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('application/json');
    });

    it('should handle HEAD request', async () => {
      const response = await fetch(`${BASE_URL}/api/currencies`, {
        method: 'HEAD',
      });

      expect(response.status).toBeLessThan(500);
    });
  });
});
