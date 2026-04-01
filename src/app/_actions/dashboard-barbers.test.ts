import { getShopByUserId, createBarber, updateBarber, deleteBarber, BarberData } from "./dashboard-barbers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StorageService } from "@/services/storageService";
import { getAuthenticatedBarberShopContext } from "./_helpers/auth-context";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    barberShop: {
      findUnique: jest.fn(),
    },
    barber: {
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("./_helpers/auth-context", () => ({
  getAuthenticatedBarberShopContext: jest.fn(),
}));

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock StorageService to avoid uuid import issues
jest.mock("@/services/storageService", () => ({
  StorageService: {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  },
}));

type MockFn = jest.Mock;
type MockPrismaType = {
  user: { findUnique: MockFn };
  barberShop: { findUnique: MockFn };
  barber: {
    count: MockFn;
    create: MockFn;
    findFirst: MockFn;
    findUnique: MockFn;
    update: MockFn;
    updateMany: MockFn;
    delete: MockFn;
    deleteMany: MockFn;
  };
};

const mockPrisma = prisma as unknown as MockPrismaType;
const mockRevalidatePath = revalidatePath as jest.Mock;
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;
const mockAuthContext = getAuthenticatedBarberShopContext as jest.MockedFunction<typeof getAuthenticatedBarberShopContext>;

describe("Dashboard Barbers Server Actions", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockAuthContext.mockResolvedValue({
      supabaseUserId: "supabase-id-1",
      userId: "user-1",
      barberShopId: "shop-1",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
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

      mockPrisma.barberShop.findUnique.mockResolvedValue(mockShop);

      const result = await getShopByUserId();
      expect(result).toEqual(mockShop);
    });

    it("should return null when user has no shop", async () => {
      mockAuthContext.mockResolvedValue(null);

      const result = await getShopByUserId();
      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      mockAuthContext.mockRejectedValue(new Error("DB error"));

      const result = await getShopByUserId();
      
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching shop:", expect.any(Error));
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

      const result = await createBarber(data);
      expect(result).toEqual({ barber: mockBarber });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/barbers");
    });

    it("should return error when barber limit (10) is reached", async () => {
      mockPrisma.barber.count.mockResolvedValue(10);

      const data: BarberData = {
        name: "Test",
        phone: "123456789",
      };

      const result = await createBarber(data);
      expect(result).toEqual({ error: "Maximum limit of 10 barbers reached." });
    });

    it("should return error on creation failure", async () => {
      mockPrisma.barber.count.mockResolvedValue(5);
      mockPrisma.barber.create.mockRejectedValue(new Error("DB error"));

      const data: BarberData = {
        name: "Test",
        phone: "123456789",
      };

      const result = await createBarber(data);
      
      expect(result).toEqual({ error: "Failed to create barber." });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error creating barber:", expect.any(Error));
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

      mockPrisma.barber.findFirst.mockResolvedValue(mockBarber);
      mockPrisma.barber.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.barber.findFirst.mockResolvedValueOnce(mockBarber).mockResolvedValueOnce(mockBarber);

      const data: Partial<BarberData> = {
        name: "Miguel Updated",
        instagram: "@miguel_updated",
      };

      const result = await updateBarber("barber-1", data);
      
      expect(result).toEqual({ barber: mockBarber });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/barbers");
    });

    it("should delete old image when updating with new image", async () => {
      const existingBarber = {
        id: "barber-1",
        name: "Miguel",
        phone: "987654321",
        description: "Expert",
        imageUrl: "old-image-url.jpg",
        instagram: "@miguel",
        barberShopId: "shop-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBarber = {
        ...existingBarber,
        imageUrl: "new-image-url.jpg",
      };

      mockPrisma.barber.findFirst.mockResolvedValueOnce(existingBarber).mockResolvedValueOnce(updatedBarber);
      mockPrisma.barber.updateMany.mockResolvedValue({ count: 1 });
      mockStorageService.deleteImage.mockResolvedValue(undefined);

      const data: Partial<BarberData> = {
        imageUrl: "new-image-url.jpg",
      };

      const result = await updateBarber("barber-1", data);

      expect(mockStorageService.deleteImage).toHaveBeenCalledWith("old-image-url.jpg");
      expect(result).toEqual({ barber: updatedBarber });
    });

    it("should not delete image when updating without changing image", async () => {
      const existingBarber = {
        id: "barber-1",
        name: "Miguel",
        phone: "987654321",
        description: "Expert",
        imageUrl: "same-image-url.jpg",
        instagram: "@miguel",
        barberShopId: "shop-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.barber.findFirst.mockResolvedValueOnce(existingBarber).mockResolvedValueOnce(existingBarber);
      mockPrisma.barber.updateMany.mockResolvedValue({ count: 1 });

      const data: Partial<BarberData> = {
        name: "Miguel Updated",
      };

      await updateBarber("barber-1", data);

      expect(mockStorageService.deleteImage).not.toHaveBeenCalled();
    });

    it("should not delete image when barber has no existing image", async () => {
      const existingBarber = {
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

      const updatedBarber = {
        ...existingBarber,
        imageUrl: "new-image-url.jpg",
      };

      mockPrisma.barber.findFirst.mockResolvedValueOnce(existingBarber).mockResolvedValueOnce(updatedBarber);
      mockPrisma.barber.updateMany.mockResolvedValue({ count: 1 });

      const data: Partial<BarberData> = {
        imageUrl: "new-image-url.jpg",
      };

      await updateBarber("barber-1", data);

      expect(mockStorageService.deleteImage).not.toHaveBeenCalled();
    });

    it("should return error on update failure", async () => {
      mockPrisma.barber.findFirst.mockResolvedValue({ id: "barber-1", barberShopId: "shop-1" });
      mockPrisma.barber.updateMany.mockRejectedValue(new Error("DB error"));

      const result = await updateBarber("barber-1", { name: "Test" });
      
      expect(result).toEqual({ error: "Failed to update barber." });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating barber:", expect.any(Error));
    });
  });

  describe("deleteBarber", () => {
    it("should delete barber successfully without image", async () => {
      const mockBarber = {
        id: "barber-1",
        name: "Test",
        phone: "123456789",
        description: null,
        imageUrl: null,
        instagram: null,
        barberShopId: "shop-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.barber.findFirst.mockResolvedValue(mockBarber);
      mockPrisma.barber.count.mockResolvedValue(2); // 2 barbers, can delete one
      mockPrisma.barber.deleteMany.mockResolvedValue({ count: 1 });

      const result = await deleteBarber("barber-1");
      
      expect(result).toEqual({ success: true });
      expect(mockStorageService.deleteImage).not.toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/barbers");
    });

    it("should delete barber and its image when image exists", async () => {
      const mockBarber = {
        id: "barber-1",
        name: "Test",
        phone: "123456789",
        description: null,
        imageUrl: "barber-image-url.jpg",
        instagram: null,
        barberShopId: "shop-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.barber.findFirst.mockResolvedValue(mockBarber);
      mockPrisma.barber.count.mockResolvedValue(3); // 3 barbers, can delete one
      mockPrisma.barber.deleteMany.mockResolvedValue({ count: 1 });
      mockStorageService.deleteImage.mockResolvedValue(undefined);

      const result = await deleteBarber("barber-1");

      expect(mockStorageService.deleteImage).toHaveBeenCalledWith("barber-image-url.jpg");
      expect(mockPrisma.barber.deleteMany).toHaveBeenCalledWith({ where: { id: "barber-1", barberShopId: "shop-1" } });
      expect(result).toEqual({ success: true });
    });

    it("should prevent deleting the last barber (minimum 1 required)", async () => {
      const mockBarber = {
        id: "barber-1",
        name: "Last Barber",
        phone: "123456789",
        description: null,
        imageUrl: null,
        instagram: null,
        barberShopId: "shop-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.barber.findFirst.mockResolvedValue(mockBarber);
      mockPrisma.barber.count.mockResolvedValue(1); // Only 1 barber left

      const result = await deleteBarber("barber-1");

      expect(result).toEqual({ error: "Cannot delete the last barber. At least 1 barber is required." });
      expect(mockPrisma.barber.deleteMany).not.toHaveBeenCalled();
      expect(mockStorageService.deleteImage).not.toHaveBeenCalled();
    });

    it("should return error when barber not found", async () => {
      mockPrisma.barber.findFirst.mockResolvedValue(null);

      const result = await deleteBarber("non-existent-id");

      expect(result).toEqual({ error: "Barber not found." });
      expect(mockPrisma.barber.count).not.toHaveBeenCalled();
      expect(mockPrisma.barber.deleteMany).not.toHaveBeenCalled();
    });

    it("should return error on delete failure", async () => {
      const mockBarber = {
        id: "barber-1",
        name: "Test",
        phone: "123456789",
        description: null,
        imageUrl: null,
        instagram: null,
        barberShopId: "shop-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.barber.findFirst.mockResolvedValue(mockBarber);
      mockPrisma.barber.count.mockResolvedValue(2);
      mockPrisma.barber.deleteMany.mockRejectedValue(new Error("DB error"));

      const result = await deleteBarber("barber-1");
      
      expect(result).toEqual({ error: "Failed to delete barber." });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting barber:", expect.any(Error));
    });
  });
});
