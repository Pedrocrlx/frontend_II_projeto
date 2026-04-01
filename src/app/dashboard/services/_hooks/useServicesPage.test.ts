/**
 * Unit tests for useServicesPage hook
 * 
 * Tests verify:
 * 1. Hook state management (loading, form data, drawer state)
 * 2. Data fetching and error handling
 * 3. CRUD operations (create, update, delete)
 * 4. Form validation (name required, price/duration validation)
 * 5. Auth guard behavior
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useServicesPage, type Service } from "./useServicesPage";
import { toast } from "sonner";

// Mock server actions first (before any imports that use them)
const mockGetShopByUserId = jest.fn();
const mockCreateService = jest.fn();
const mockUpdateService = jest.fn();
const mockDeleteService = jest.fn();

jest.mock("@/app/_actions/dashboard-services", () => ({
  getShopByUserId: (...args: unknown[]) => mockGetShopByUserId(...args),
  createService: (...args: unknown[]) => mockCreateService(...args),
  updateService: (...args: unknown[]) => mockUpdateService(...args),
  deleteService: (...args: unknown[]) => mockDeleteService(...args),
}));

// Mock dependencies
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

jest.mock("@/contexts/I18nContext", () => ({
  useI18n: jest.fn(() => ({
    t: {
      dashboard: {
        services: {
          errorTitle: "Error loading services",
          errorNotAuth: "Not authenticated",
          errorNoShop: "No shop found",
          errorNoName: "Name is required",
          successCreated: "Service created",
          successUpdated: "Service updated",
          successDeleted: "Service deleted",
          errorGeneric: "An error occurred",
          errorDelete: "Failed to delete service",
          deleteConfirm: "Are you sure?",
        },
      },
    },
  })),
}));

jest.mock("sonner");

type MockFn = jest.Mock;

const mockToast = toast as jest.Mocked<typeof toast>;

// Mock window.confirm
const originalConfirm = window.confirm;

describe("useServicesPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  const mockFullService = {
    id: "service-1",
    name: "Haircut",
    description: "Classic haircut",
    price: "25.00",
    duration: 30,
    barberShopId: "shop-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService: Service = {
    id: "service-1",
    name: "Haircut",
    description: "Classic haircut",
    price: "25.00",
    duration: 30,
  };

  const mockShop = {
    id: "shop-1",
    userId: "user-1",
    slug: "test-shop",
    name: "Test Barbershop",
    description: "A test barbershop",
    phone: "+351910000000",
    address: "Test Address",
    instagram: null,
    logoUrl: null,
    primaryColor: null,
    secondaryColor: null,
    config: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [mockFullService],
  };

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    
    // Default mocks
    mockGetShopByUserId.mockResolvedValue(mockShop);
    mockToast.error = jest.fn() as MockFn;
    mockToast.success = jest.fn() as MockFn;
    
    // Mock confirm
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    window.confirm = originalConfirm;
  });

  describe("Initial state and data fetching", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useServicesPage());

      expect(result.current.services).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isDrawerOpen).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.editingId).toBeNull();
      expect(result.current.formData).toEqual({
        name: "",
        description: "",
        price: 15,
        duration: 30,
      });
    });

    it("should fetch shop data on mount when authenticated", async () => {
      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetShopByUserId).toHaveBeenCalledTimes(1);
      expect(result.current.services).toHaveLength(1);
      expect(result.current.services[0]).toMatchObject({
        id: mockService.id,
        name: mockService.name,
        description: mockService.description,
        price: mockService.price,
        duration: mockService.duration,
      });
    });

    it("should handle empty shop data gracefully", async () => {
      mockGetShopByUserId.mockResolvedValue(null);

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.services).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("No shop found for current authenticated user.");
    });

    it("should handle fetch errors and show error toast", async () => {
      const error = new Error("Network error");
      mockGetShopByUserId.mockRejectedValue(error);

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching shop data:", error);
      expect(mockToast.error).toHaveBeenCalledWith("Error loading services");
      expect(result.current.services).toEqual([]);
    });
  });

  describe("Opening add/edit drawer", () => {
    it("should open drawer in add mode with clean form", async () => {
      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      expect(result.current.isDrawerOpen).toBe(true);
      expect(result.current.editingId).toBeNull();
      expect(result.current.formData).toEqual({
        name: "",
        description: "",
        price: 15,
        duration: 30,
      });
    });

    it("should open drawer in edit mode with service data", async () => {
      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(mockService);
      });

      expect(result.current.isDrawerOpen).toBe(true);
      expect(result.current.editingId).toBe("service-1");
      expect(result.current.formData).toEqual({
        name: "Haircut",
        description: "Classic haircut",
        price: 25, // Converted to number
        duration: 30,
      });
    });

    it("should handle service with null description", async () => {
      const serviceWithoutDesc: Service = {
        ...mockService,
        description: null,
      };

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(serviceWithoutDesc);
      });

      expect(result.current.formData.description).toBe("");
    });
  });

  describe("Form submission - create service", () => {
    it("should create service successfully with valid data", async () => {
      mockCreateService.mockResolvedValue({ service: mockFullService });

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "Beard Trim",
          description: "Professional beard trimming",
          price: 15,
          duration: 20,
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      expect(mockCreateService).toHaveBeenCalledWith({
        name: "Beard Trim",
        description: "Professional beard trimming",
        price: 15,
        duration: 20,
      });
      expect(mockToast.success).toHaveBeenCalledWith("Service created");
      expect(result.current.isDrawerOpen).toBe(false);
    });

    it("should validate name is not empty", async () => {
      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "   ", // Whitespace only
          description: "",
          price: 15,
          duration: 30,
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Name is required");
      expect(mockCreateService).not.toHaveBeenCalled();
    });

    it("should handle creation errors from server action", async () => {
      mockCreateService.mockResolvedValue({ error: "Service limit reached" });

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "Test Service",
          description: "",
          price: 15,
          duration: 30,
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Service limit reached");
      expect(result.current.isDrawerOpen).toBe(true); // Drawer stays open on error
    });
  });

  describe("Form submission - update service", () => {
    it("should update service successfully", async () => {
      mockUpdateService.mockResolvedValue({ service: mockFullService });

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(mockService);
      });

      act(() => {
        result.current.setFormData({
          ...result.current.formData,
          name: "Haircut & Styling",
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      expect(mockUpdateService).toHaveBeenCalledWith("service-1", {
        name: "Haircut & Styling",
        description: "Classic haircut",
        price: 25,
        duration: 30,
      });
      expect(mockToast.success).toHaveBeenCalledWith("Service updated");
      expect(result.current.isDrawerOpen).toBe(false);
    });

    it("should handle update errors from server action", async () => {
      mockUpdateService.mockResolvedValue({ error: "Update failed" });

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(mockService);
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Update failed");
      expect(result.current.isDrawerOpen).toBe(true);
    });
  });

  describe("Delete service", () => {
    it("should delete service successfully when confirmed", async () => {
      mockDeleteService.mockResolvedValue({ success: true });
      window.confirm = jest.fn(() => true);

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDelete("service-1");
      });

      expect(window.confirm).toHaveBeenCalledWith("Are you sure?");
      expect(mockDeleteService).toHaveBeenCalledWith("service-1");
      expect(mockToast.success).toHaveBeenCalledWith("Service deleted");
    });

    it("should not delete when user cancels confirmation", async () => {
      window.confirm = jest.fn(() => false);

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDelete("service-1");
      });

      expect(window.confirm).toHaveBeenCalledWith("Are you sure?");
      expect(mockDeleteService).not.toHaveBeenCalled();
      expect(mockToast.success).not.toHaveBeenCalled();
    });

    it("should handle delete errors from server action", async () => {
      mockDeleteService.mockResolvedValue({ error: "Cannot delete last service" });
      window.confirm = jest.fn(() => true);

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDelete("service-1");
      });

      expect(mockToast.error).toHaveBeenCalledWith("Cannot delete last service");
    });

    it("should handle unexpected errors during delete", async () => {
      mockDeleteService.mockRejectedValue(new Error("Network error"));
      window.confirm = jest.fn(() => true);

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDelete("service-1");
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Delete error:", expect.any(Error));
      expect(mockToast.error).toHaveBeenCalledWith("Network error"); // extractErrorMessage uses Error.message
    });
  });

  describe("Auth guard", () => {
    it("should show auth error when submitting while not authenticated", async () => {
      // Mock unauthenticated state
      const { useAuth } = require("@/contexts/AuthContext");
      useAuth.mockReturnValue({ isAuthenticated: false });

      const { result } = renderHook(() => useServicesPage());

      // Don't wait for isLoading to be false - hook returns early when not authenticated
      await new Promise((resolve) => setTimeout(resolve, 100));

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "Test Service",
          description: "",
          price: 15,
          duration: 30,
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Not authenticated");
      expect(mockCreateService).not.toHaveBeenCalled();

      // Restore mock
      useAuth.mockReturnValue({ isAuthenticated: true });
    });

    it("should show shop error when no shop exists", async () => {
      mockGetShopByUserId.mockResolvedValue(null);

      const { result } = renderHook(() => useServicesPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "Test Service",
          description: "",
          price: 15,
          duration: 30,
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("No shop found");
      expect(mockCreateService).not.toHaveBeenCalled();
    });
  });
});
