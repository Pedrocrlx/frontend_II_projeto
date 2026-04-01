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

type MockablePrisma = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  barberShop: {
    findUnique: jest.Mock;
  };
  $transaction: jest.Mock;
};

const prismaMock = mockPrisma as unknown as MockablePrisma;

interface MockAuthClient {
  auth: {
    getUser: jest.Mock;
  };
}

function makeRequest(payload: unknown, token?: string) {
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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);

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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);

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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);

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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);

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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);

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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);

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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);
    prismaMock.user.findUnique.mockResolvedValue({ id: "db-user-1" });
    prismaMock.barberShop.findUnique.mockResolvedValue({ id: "existing-shop" });

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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);
    prismaMock.user.findUnique.mockResolvedValue(null); // User doesn't exist yet
    prismaMock.user.create.mockResolvedValue({
      id: "new-db-user-1",
      supabaseId: "supabase-user-1",
      email: "newuser@example.com",
    });
    prismaMock.barberShop.findUnique.mockResolvedValue(null); // Slug available
    prismaMock.$transaction.mockResolvedValue({
      id: "new-shop-1",
      slug: "test-barbershop",
    });

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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "existing-db-user-1",
      supabaseId: "supabase-user-1",
      email: "existing@example.com",
    });
    prismaMock.barberShop.findUnique.mockResolvedValue(null); // Slug available
    prismaMock.$transaction.mockResolvedValue({
      id: "new-shop-1",
      slug: "test-barbershop",
    });

    const request = makeRequest(validPayload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.barberShopId).toBe("new-shop-1");
    expect(body.slug).toBe("test-barbershop");
    expect(mockPrisma.user.create).not.toHaveBeenCalled(); // Should not create new user
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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);
    prismaMock.user.findUnique.mockResolvedValue({ id: "db-user-1" });
    prismaMock.barberShop.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
      await callback(mockTransactionCallback);
      return { id: "new-shop-1", slug: "test-barbershop" };
    });

    const request = makeRequest(validPayload, "valid-token");
    await POST(request);

    expect(prismaMock.$transaction).toHaveBeenCalled();
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

    mockSupabase.mockReturnValue(mockAuthClient as MockAuthClient);
    prismaMock.user.findUnique.mockRejectedValue(new Error("Database connection failed"));

    const request = makeRequest(validPayload, "valid-token");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
