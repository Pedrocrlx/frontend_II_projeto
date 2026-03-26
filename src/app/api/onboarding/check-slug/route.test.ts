/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    barberShop: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockFindUnique = prisma.barberShop.findUnique as jest.Mock;

function makeRequest(slug: string) {
  const url = `http://localhost/api/onboarding/check-slug?slug=${encodeURIComponent(slug)}`;
  return new NextRequest(url);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/onboarding/check-slug", () => {
  it("should return available: true when slug is unique", async () => {
    mockFindUnique.mockResolvedValue(null); // No existing shop with this slug
    
    const request = makeRequest("my-awesome-shop");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.available).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { slug: "my-awesome-shop" },
    });
  });

  it("should return available: false when slug already exists", async () => {
    mockFindUnique.mockResolvedValue({ id: "shop-1", slug: "existing-shop" });
    
    const request = makeRequest("existing-shop");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.available).toBe(false);
  });

  it("should return available: false for reserved slugs", async () => {
    const reservedSlugs = ["admin", "api", "auth", "dashboard", "pricing", "about"];
    
    for (const slug of reservedSlugs) {
      const request = makeRequest(slug);
      const response = await GET(request);
      const body = await response.json();

      expect(body.available).toBe(false);
      expect(mockFindUnique).not.toHaveBeenCalled(); // Should not query DB for reserved slugs
      
      jest.clearAllMocks();
    }
  });

  it("should return available: false for slugs shorter than 3 characters", async () => {
    const request = makeRequest("ab");
    const response = await GET(request);
    const body = await response.json();

    expect(body.available).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("should return available: false for slugs longer than 50 characters", async () => {
    const longSlug = "a".repeat(51);
    const request = makeRequest(longSlug);
    const response = await GET(request);
    const body = await response.json();

    expect(body.available).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("should return available: false for slugs with invalid characters", async () => {
    const invalidSlugs = ["My Shop", "shop@123", "shop_name"];
    
    for (const slug of invalidSlugs) {
      const request = makeRequest(slug);
      const response = await GET(request);
      const body = await response.json();

      expect(body.available).toBe(false);
      expect(mockFindUnique).not.toHaveBeenCalled();
      
      jest.clearAllMocks();
    }
  });

  it("should normalize uppercase slug to lowercase and check availability", async () => {
    mockFindUnique.mockResolvedValue(null);
    
    const request = makeRequest("SHOP");
    const response = await GET(request);
    const body = await response.json();

    expect(body.available).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { slug: "shop" },
    });
  });

  it("should normalize slug to lowercase before checking", async () => {
    mockFindUnique.mockResolvedValue(null);
    
    const request = makeRequest("My-Shop-Name");
    await GET(request);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { slug: "my-shop-name" },
    });
  });

  it("should trim whitespace from slug", async () => {
    mockFindUnique.mockResolvedValue(null);
    
    const request = makeRequest("  my-shop  ");
    await GET(request);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { slug: "my-shop" },
    });
  });

  it("should accept valid slugs with hyphens and numbers", async () => {
    mockFindUnique.mockResolvedValue(null);
    
    const request = makeRequest("barber-shop-123");
    const response = await GET(request);
    const body = await response.json();

    expect(body.available).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { slug: "barber-shop-123" },
    });
  });

  it("should return available: false when slug parameter is missing", async () => {
    const url = `http://localhost/api/onboarding/check-slug`;
    const request = new NextRequest(url);
    
    const response = await GET(request);
    const body = await response.json();

    expect(body.available).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
