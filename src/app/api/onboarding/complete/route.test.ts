/**
 * @jest-environment node
 */
import { POST } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    barberShop: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockSupabase = createClient as jest.Mock;

function makeRequest(payload: any, token?: string) {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return new NextRequest("http://localhost/api/onboarding/complete", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

const validPayload = {
  shop: {
    name: "Test Barbershop",
    slug: "test-barbershop",
    description: "A great barbershop",
    phone: "+351912345678",
    address: "123 Main St",
  },
  barbers: [
    { name: "John Doe", specialty: "Haircuts", phone: "912345678", instagram: "@john" },
  ],
  services: [
    { name: "Haircut", price: "20", duration: "30" },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("POST /api/onboarding/complete", () => {
  it("should return 401 when no authorization header is provided", async () => {
    const request = makeRequest(validPayload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 401 when authorization header is not Bearer token", async () => {
    const headers = new Headers();
    headers.set("authorization", "InvalidFormat token123");
    headers.set("content-type", "application/json");

    const request = new NextRequest("http://localhost/api/onboarding/complete", {
      method: "POST",
      headers,
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 401 when Supabase token is invalid", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("Invalid token"),
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);

    const request = makeRequest(validPayload, "invalid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 400 when shop name is too short", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "test@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);

    const payload = {
      ...validPayload,
      shop: { ...validPayload.shop, name: "AB" }, // Too short
    };

    const request = makeRequest(payload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Shop name must be at least 3 characters");
  });

  it("should return 400 when slug is invalid (special characters)", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "test@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);

    const payload = {
      ...validPayload,
      shop: { ...validPayload.shop, slug: "invalid_slug!" }, // Invalid characters
    };

    const request = makeRequest(payload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Slug must only contain lowercase letters, numbers, and hyphens");
  });

  it("should return 400 when slug is reserved", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "test@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);

    const reservedSlugs = ["admin", "api", "dashboard"];

    for (const slug of reservedSlugs) {
      const payload = {
        ...validPayload,
        shop: { ...validPayload.shop, slug },
      };

      const request = makeRequest(payload, "valid-token");
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("This slug is reserved");

      jest.clearAllMocks();
    }
  });

  it("should return 400 when no valid barbers provided", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "test@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);

    const payload = {
      ...validPayload,
      barbers: [{ name: "", phone: "" }], // Invalid barber
    };

    const request = makeRequest(payload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("At least one barber with name and phone is required");
  });

  it("should return 400 when no valid services provided", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "test@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);

    const payload = {
      ...validPayload,
      services: [{ name: "", price: "" }], // Invalid service
    };

    const request = makeRequest(payload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("At least one service with name and price is required");
  });

  it("should return 409 when slug already exists", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "test@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);
    mockPrisma.user.findUnique.mockResolvedValue({ id: "db-user-1" } as any);
    mockPrisma.barberShop.findUnique.mockResolvedValue({ id: "existing-shop" } as any);

    const request = makeRequest(validPayload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe("This slug is already taken");
  });

  it("should create user on first login and complete onboarding", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "supabase-user-1", email: "newuser@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);
    mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist yet
    mockPrisma.user.create.mockResolvedValue({
      id: "new-db-user-1",
      supabaseId: "supabase-user-1",
      email: "newuser@example.com",
    } as any);
    mockPrisma.barberShop.findUnique.mockResolvedValue(null); // Slug available
    mockPrisma.$transaction.mockResolvedValue({
      id: "new-shop-1",
      slug: "test-barbershop",
    } as any);

    const request = makeRequest(validPayload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.barberShopId).toBe("new-shop-1");
    expect(body.slug).toBe("test-barbershop");
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        supabaseId: "supabase-user-1",
        email: "newuser@example.com",
      },
    });
  });

  it("should complete onboarding for existing user successfully", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "supabase-user-1", email: "existing@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "existing-db-user-1",
      supabaseId: "supabase-user-1",
      email: "existing@example.com",
    } as any);
    mockPrisma.barberShop.findUnique.mockResolvedValue(null); // Slug available
    mockPrisma.$transaction.mockResolvedValue({
      id: "new-shop-1",
      slug: "test-barbershop",
    } as any);

    const request = makeRequest(validPayload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.barberShopId).toBe("new-shop-1");
    expect(body.slug).toBe("test-barbershop");
    expect(mockPrisma.user.create).not.toHaveBeenCalled(); // Should not create new user
  });

  it("should link existing user by email when supabaseId is missing", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "supabase-user-new", email: "legacy@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);
    
    // First call (by supabaseId) returns null, second call (by email) finds existing user
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(null) // Not found by supabaseId
      .mockResolvedValueOnce({     // Found by email
        id: "legacy-user-1",
        email: "legacy@example.com",
        supabaseId: null,
      } as any);
    
    mockPrisma.user.update.mockResolvedValue({
      id: "legacy-user-1",
      email: "legacy@example.com",
      supabaseId: "supabase-user-new",
    } as any);
    
    mockPrisma.barberShop.findUnique.mockResolvedValue(null); // Slug available
    mockPrisma.$transaction.mockResolvedValue({
      id: "new-shop-1",
      slug: "test-barbershop",
    } as any);

    const request = makeRequest(validPayload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.barberShopId).toBe("new-shop-1");
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { email: "legacy@example.com" },
      data: { supabaseId: "supabase-user-new" },
    });
    expect(mockPrisma.user.create).not.toHaveBeenCalled(); // Should not create, just update
  });

  it("should create barbers and services in atomic transaction", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "supabase-user-1", email: "test@example.com" } },
          error: null,
        }),
      },
    };

    const mockTransactionCallback = jest.fn();

    mockSupabase.mockReturnValue(mockAuthClient as any);
    mockPrisma.user.findUnique.mockResolvedValue({ id: "db-user-1" } as any);
    mockPrisma.barberShop.findUnique.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      await callback(mockTransactionCallback);
      return { id: "new-shop-1", slug: "test-barbershop" };
    });

    const request = makeRequest(validPayload, "valid-token");
    await POST(request);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("should return 500 on internal server error", async () => {
    const mockAuthClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "test@example.com" } },
          error: null,
        }),
      },
    };

    mockSupabase.mockReturnValue(mockAuthClient as any);
    mockPrisma.user.findUnique.mockRejectedValue(new Error("Database connection failed"));

    const request = makeRequest(validPayload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
