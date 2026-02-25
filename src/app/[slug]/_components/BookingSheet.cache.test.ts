/**
 * Tests for availability caching functionality
 * 
 * Note: These tests verify the caching logic conceptually.
 * The actual cache is module-level in BookingSheet.tsx and shared across all instances.
 */

describe("Availability Cache Logic", () => {
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  // Helper function to generate cache key (same logic as in BookingSheet)
  function generateCacheKey(barberId: string, startDate: Date, endDate: Date): string {
    return `${barberId}-${startDate.toISOString()}-${endDate.toISOString()}`;
  }

  // Helper function to check if cache is fresh (same logic as in BookingSheet)
  function isCacheFresh(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL_MS;
  }

  it("should generate consistent cache keys for same inputs", () => {
    const barberId = "barber-123";
    const startDate = new Date("2024-02-01T00:00:00Z");
    const endDate = new Date("2024-03-01T00:00:00Z");

    const key1 = generateCacheKey(barberId, startDate, endDate);
    const key2 = generateCacheKey(barberId, startDate, endDate);

    expect(key1).toBe(key2);
  });

  it("should generate different cache keys for different barbers", () => {
    const startDate = new Date("2024-02-01T00:00:00Z");
    const endDate = new Date("2024-03-01T00:00:00Z");

    const key1 = generateCacheKey("barber-123", startDate, endDate);
    const key2 = generateCacheKey("barber-456", startDate, endDate);

    expect(key1).not.toBe(key2);
  });

  it("should generate different cache keys for different date ranges", () => {
    const barberId = "barber-123";
    const startDate1 = new Date("2024-02-01T00:00:00Z");
    const endDate1 = new Date("2024-03-01T00:00:00Z");
    const startDate2 = new Date("2024-02-02T00:00:00Z");
    const endDate2 = new Date("2024-03-02T00:00:00Z");

    const key1 = generateCacheKey(barberId, startDate1, endDate1);
    const key2 = generateCacheKey(barberId, startDate2, endDate2);

    expect(key1).not.toBe(key2);
  });

  it("should consider cache fresh within TTL", () => {
    const now = Date.now();
    const recentTimestamp = now - (2 * 60 * 1000); // 2 minutes ago

    expect(isCacheFresh(recentTimestamp)).toBe(true);
  });

  it("should consider cache stale after TTL", () => {
    const now = Date.now();
    const oldTimestamp = now - (6 * 60 * 1000); // 6 minutes ago (past 5-minute TTL)

    expect(isCacheFresh(oldTimestamp)).toBe(false);
  });

  it("should consider cache fresh at exactly TTL boundary", () => {
    const now = Date.now();
    const boundaryTimestamp = now - CACHE_TTL_MS + 100; // Just under 5 minutes

    expect(isCacheFresh(boundaryTimestamp)).toBe(true);
  });

  it("should consider cache stale just past TTL boundary", () => {
    const now = Date.now();
    const boundaryTimestamp = now - CACHE_TTL_MS - 100; // Just over 5 minutes

    expect(isCacheFresh(boundaryTimestamp)).toBe(false);
  });
});
