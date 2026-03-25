import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockRevalidatePath = revalidatePath as jest.Mock;

describe("Dashboard Services Actions", () => {
  const mockUserId = "user-123";
  const mockShopId = "shop-123";
  const mockServiceId = "service-123";
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getShopByUserId", () => {
    it("should return shop with services and convert Decimal prices to strings", async () => {
      const mockShop = {
        id: mockShopId,
        name: "Shop 1",
        services: [
          { id: "s1", name: "Haircut", price: { toString: () => "25.00" }, duration: 30, barberShopId: mockShopId },
          { id: "s2", name: "Shave", price: { toString: () => "15.50" }, duration: 20, barberShopId: mockShopId },
        ],
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "internal-id",
        barberShop: mockShop,
      });

      const result = await getShopByUserId(mockUserId);
      
      expect(result).toBeDefined();
      expect(result?.services).toHaveLength(2);
      expect(typeof result?.services[0].price).toBe("string");
      expect(result?.services[0].price).toBe("25.00");
      expect(typeof result?.services[1].price).toBe("string");
      expect(result?.services[1].price).toBe("15.50");
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

    it("should return null and log error on database failure", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"));
      
      const result = await getShopByUserId(mockUserId);
      
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching shop:", expect.any(Error));
    });
  });

  describe("createService", () => {
    const serviceData = {
      name: "New Service",
      price: 20,
      duration: 30,
    };

    it("should create a service when limit is not reached and convert price to string", async () => {
      (prisma.service.count as jest.Mock).mockResolvedValue(5);
      (prisma.service.create as jest.Mock).mockResolvedValue({ 
        id: mockServiceId, 
        ...serviceData,
        price: { toString: () => "20" }
      });

      const result = await createService(mockShopId, serviceData);
      
      expect(result.service).toBeDefined();
      expect(typeof result.service?.price).toBe("string");
      expect(result.service?.price).toBe("20");
      expect(prisma.service.create).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/services");
    });

    it("should return error when limit (20) is reached", async () => {
      (prisma.service.count as jest.Mock).mockResolvedValue(20);
      const result = await createService(mockShopId, serviceData);
      expect(result.error).toBe("Maximum limit of 20 services reached.");
      expect(prisma.service.create).not.toHaveBeenCalled();
    });

    it("should return error and log on creation failure", async () => {
      (prisma.service.count as jest.Mock).mockResolvedValue(5);
      (prisma.service.create as jest.Mock).mockRejectedValue(new Error("DB error"));
      
      const result = await createService(mockShopId, serviceData);
      
      expect(result.error).toBe("Failed to create service.");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error creating service:", expect.any(Error));
    });
  });

  describe("updateService", () => {
    it("should update a service and convert price to string", async () => {
      const updateData = { name: "Updated Name" };
      (prisma.service.update as jest.Mock).mockResolvedValue({ 
        id: mockServiceId, 
        ...updateData,
        price: { toString: () => "20" }  // Mock Decimal with toString method
      });

      const result = await updateService(mockServiceId, updateData);
      
      expect(result.service).toBeDefined();
      expect(typeof result.service?.price).toBe("string");
      expect(result.service?.price).toBe("20");
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: mockServiceId },
        data: updateData,
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/services");
    });

    it("should return error and log on update failure", async () => {
      (prisma.service.update as jest.Mock).mockRejectedValue(new Error("DB error"));
      
      const result = await updateService(mockServiceId, { name: "Test" });
      
      expect(result.error).toBe("Failed to update service.");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating service:", expect.any(Error));
    });
  });

  describe("deleteService", () => {
    it("should delete a service when more than 1 service exists", async () => {
      const mockService = {
        id: mockServiceId,
        name: "Service 1",
        price: { toString: () => "20" },
        duration: 30,
        barberShopId: mockShopId,
      };

      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.service.count as jest.Mock).mockResolvedValue(2); // 2 services exist
      (prisma.service.delete as jest.Mock).mockResolvedValue({});
      
      const result = await deleteService(mockServiceId);
      
      expect(result.success).toBe(true);
      expect(prisma.service.delete).toHaveBeenCalledWith({
        where: { id: mockServiceId },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/services");
    });

    it("should prevent deleting the last service (minimum 1 required)", async () => {
      const mockService = {
        id: mockServiceId,
        name: "Last Service",
        price: { toString: () => "20" },
        duration: 30,
        barberShopId: mockShopId,
      };

      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.service.count as jest.Mock).mockResolvedValue(1); // Only 1 service left

      const result = await deleteService(mockServiceId);

      expect(result.error).toBe("Cannot delete the last service. At least 1 service is required.");
      expect(prisma.service.delete).not.toHaveBeenCalled();
    });

    it("should return error when service not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await deleteService(mockServiceId);

      expect(result.error).toBe("Service not found.");
      expect(prisma.service.count).not.toHaveBeenCalled();
      expect(prisma.service.delete).not.toHaveBeenCalled();
    });

    it("should return error and log on delete failure", async () => {
      const mockService = {
        id: mockServiceId,
        name: "Service 1",
        price: { toString: () => "20" },
        duration: 30,
        barberShopId: mockShopId,
      };

      (prisma.service.findUnique as jest.Mock).mockResolvedValue(mockService);
      (prisma.service.count as jest.Mock).mockResolvedValue(3);
      (prisma.service.delete as jest.Mock).mockRejectedValue(new Error("DB error"));
      
      const result = await deleteService(mockServiceId);
      
      expect(result.error).toBe("Failed to delete service.");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting service:", expect.any(Error));
    });
  });
});
