import { getShopByUserId, createBarber, updateBarber, deleteBarber, BarberData } from "./dashboard-barbers";
import { prisma } from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    barber: {
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

type MockFn = jest.Mock;
type MockPrismaType = {
  user: { findUnique: MockFn };
  barber: { count: MockFn; create: MockFn; update: MockFn; delete: MockFn };
};

const mockPrisma = prisma as unknown as MockPrismaType;

describe("Dashboard Barbers Server Actions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getShopByUserId", () => {
    it("should return shop with barbers when user exists", async () => {
      const mockShop = {
        id: "shop-1",
        name: "Test Barbershop",
        barbers: [
          { id: "barber-1", name: "Carlos", phone: "912345678", description: "Specialist", imageUrl: null, instagram: null, barberShopId: "shop-1", createdAt: new Date(), updatedAt: new Date() },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        barberShop: mockShop,
      } as any);

      const result = await getShopByUserId("supabase-id-1");
      expect(result).toEqual(mockShop);
    });

    it("should return null when user has no shop", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        barberShop: null,
      } as any);

      const result = await getShopByUserId("supabase-id-1");
      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("DB error"));

      const result = await getShopByUserId("supabase-id-1");
      expect(result).toBeNull();
    });
  });

  describe("createBarber", () => {
    it("should create a barber when under limit", async () => {
      mockPrisma.barber.count.mockResolvedValue(5);
      const mockBarber = {
        id: "barber-1",
        name: "Miguel",
        phone: "987654321",
        description: "Expert",
        imageUrl: null,
        instagram: "@miguel",
        barberShopId: "shop-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.barber.create.mockResolvedValue(mockBarber);

      const data: BarberData = {
        name: "Miguel",
        phone: "987654321",
        description: "Expert",
        instagram: "@miguel",
      };

      const result = await createBarber("shop-1", data);
      expect(result).toEqual({ barber: mockBarber });
    });

    it("should return error when barber limit (10) is reached", async () => {
      mockPrisma.barber.count.mockResolvedValue(10);

      const data: BarberData = {
        name: "Test",
        phone: "123456789",
      };

      const result = await createBarber("shop-1", data);
      expect(result).toEqual({ error: "Maximum limit of 10 barbers reached." });
    });

    it("should return error on creation failure", async () => {
      mockPrisma.barber.count.mockResolvedValue(5);
      mockPrisma.barber.create.mockRejectedValue(new Error("DB error"));

      const data: BarberData = {
        name: "Test",
        phone: "123456789",
      };

      const result = await createBarber("shop-1", data);
      expect(result).toEqual({ error: "Failed to create barber." });
    });
  });

  describe("updateBarber", () => {
    it("should update barber successfully", async () => {
      const mockBarber = {
        id: "barber-1",
        name: "Miguel Updated",
        phone: "987654321",
        description: "Expert",
        imageUrl: null,
        instagram: "@miguel_updated",
        barberShopId: "shop-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.barber.update.mockResolvedValue(mockBarber);

      const data: Partial<BarberData> = {
        name: "Miguel Updated",
        instagram: "@miguel_updated",
      };

      const result = await updateBarber("barber-1", data);
      expect(result).toEqual({ barber: mockBarber });
    });

    it("should return error on update failure", async () => {
      mockPrisma.barber.update.mockRejectedValue(new Error("DB error"));

      const result = await updateBarber("barber-1", { name: "Test" });
      expect(result).toEqual({ error: "Failed to update barber." });
    });
  });

  describe("deleteBarber", () => {
    it("should delete barber successfully", async () => {
      mockPrisma.barber.delete.mockResolvedValue({} as any);

      const result = await deleteBarber("barber-1");
      expect(result).toEqual({ success: true });
    });

    it("should return error on delete failure", async () => {
      mockPrisma.barber.delete.mockRejectedValue(new Error("DB error"));

      const result = await deleteBarber("barber-1");
      expect(result).toEqual({ error: "Failed to delete barber." });
    });
  });
});
