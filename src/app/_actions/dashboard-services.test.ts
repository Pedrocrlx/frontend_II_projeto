import { prisma } from "@/lib/prisma";
import { 
  getShopByUserId, 
  createService, 
  updateService, 
  deleteService 
} from "./dashboard-services";

// Mocking prisma and next/cache
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    service: {
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Dashboard Services Actions", () => {
  const mockUserId = "user-123";
  const mockShopId = "shop-123";
  const mockServiceId = "service-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getShopByUserId", () => {
    it("should return shop when user exists", async () => {
      const mockShop = { id: mockShopId, name: "Shop 1", services: [] };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "internal-id",
        barberShop: mockShop,
      });

      const result = await getShopByUserId(mockUserId);
      expect(result).toEqual(mockShop);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { supabaseId: mockUserId },
        include: expect.anything(),
      });
    });

    it("should return null when user has no shop", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await getShopByUserId(mockUserId);
      expect(result).toBeNull();
    });
  });

  describe("createService", () => {
    const serviceData = {
      name: "New Service",
      price: 20,
      duration: 30,
    };

    it("should create a service when limit is not reached", async () => {
      (prisma.service.count as jest.Mock).mockResolvedValue(5);
      (prisma.service.create as jest.Mock).mockResolvedValue({ id: mockServiceId, ...serviceData });

      const result = await createService(mockShopId, serviceData);
      expect(result.service).toBeDefined();
      expect(prisma.service.create).toHaveBeenCalled();
    });

    it("should return error when limit (20) is reached", async () => {
      (prisma.service.count as jest.Mock).mockResolvedValue(20);
      const result = await createService(mockShopId, serviceData);
      expect(result.error).toBe("Maximum limit of 20 services reached.");
      expect(prisma.service.create).not.toHaveBeenCalled();
    });
  });

  describe("updateService", () => {
    it("should update a service", async () => {
      const updateData = { name: "Updated Name" };
      (prisma.service.update as jest.Mock).mockResolvedValue({ 
        id: mockServiceId, 
        ...updateData,
        price: { toString: () => "20" }  // Mock Decimal with toString method
      });

      const result = await updateService(mockServiceId, updateData);
      expect(result.service).toBeDefined();
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: mockServiceId },
        data: updateData,
      });
    });
  });

  describe("deleteService", () => {
    it("should delete a service", async () => {
      (prisma.service.delete as jest.Mock).mockResolvedValue({});
      const result = await deleteService(mockServiceId);
      expect(result.success).toBe(true);
      expect(prisma.service.delete).toHaveBeenCalledWith({
        where: { id: mockServiceId },
      });
    });
  });
});
