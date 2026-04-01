/**
 * Unit tests for useBarbersPage hook
 * 
 * Tests verify:
 * 1. Hook state management (loading, form data, drawer state)
 * 2. Data fetching and error handling
 * 3. CRUD operations (create, update, delete)
 * 4. Form validation (name, phone, country detection)
 * 5. Image upload flow
 * 6. Auth guard behavior
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useBarbersPage, type Barber } from "./useBarbersPage";
import { toast } from "sonner";
import { COUNTRY_CONFIGS } from "@/lib/utils/phone-validation";

// Mock server actions first (before any imports that use them)
const mockGetShopByUserId = jest.fn();
const mockCreateBarber = jest.fn();
const mockUpdateBarber = jest.fn();
const mockDeleteBarber = jest.fn();

jest.mock("@/app/_actions/dashboard-barbers", () => ({
  getShopByUserId: (... args: unknown[]) => mockGetShopByUserId(...args),
  createBarber: (...args: unknown[]) => mockCreateBarber(...args),
  updateBarber: (...args: unknown[]) => mockUpdateBarber(...args),
  deleteBarber: (...args: unknown[]) => mockDeleteBarber(...args),
}));

// Mock dependencies
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

jest.mock("@/contexts/I18nContext", () => ({
  useI18n: jest.fn(() => ({
    t: {
      dashboard: {
        barbers: {
          errorTitle: "Error loading barbers",
          errorNotAuth: "Not authenticated",
          errorNoShop: "No shop found",
          errorNoName: "Name is required",
          phoneRequired: "Phone is required",
          successCreated: "Barber created",
          successUpdated: "Barber updated",
          successDeleted: "Barber deleted",
          errorGeneric: "An error occurred",
          errorDelete: "Failed to delete barber",
          deleteConfirm: "Are you sure?",
        },
        common: {
          errorImageType: "Invalid image type",
          errorImageSize: "Image too large",
          uploadingImage: "Uploading...",
          imageUploaded: "Image uploaded",
          imageUploadedNew: "Image uploaded (new)",
          uploadFailed: "Upload failed",
        },
      },
    },
  })),
}));

const mockUploadImage = jest.fn();
const mockDeleteImage = jest.fn();

jest.mock("@/services/storageService", () => ({
  StorageService: {
    uploadImage: (...args: unknown[]) => mockUploadImage(...args),
    deleteImage: (...args: unknown[]) => mockDeleteImage(...args),
  },
}));

jest.mock("sonner");

type MockFn = jest.Mock;

const mockToast = toast as jest.Mocked<typeof toast>;

// Mock window.confirm
const originalConfirm = window.confirm;

describe("useBarbersPage", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  const mockFullBarber = {
    id: "barber-1",
    name: "Carlos Silva",
    description: "Specialist",
    phone: "+351912345678",
    instagram: "@carlos",
    imageUrl: "https://example.com/carlos.jpg",
    barberShopId: "shop-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBarber: Barber = {
    id: "barber-1",
    name: "Carlos Silva",
    description: "Specialist",
    phone: "+351912345678",
    instagram: "@carlos",
    imageUrl: "https://example.com/carlos.jpg",
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
    barbers: [mockFullBarber],
  };

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    
    // Default mocks
    mockGetShopByUserId.mockResolvedValue(mockShop);
    mockToast.error = jest.fn() as MockFn;
    mockToast.success = jest.fn() as MockFn;
    mockToast.loading = jest.fn(() => "toast-id") as MockFn;
    
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
      const { result } = renderHook(() => useBarbersPage());

      expect(result.current.barbers).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isDrawerOpen).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.selectedCountry).toBe("PT");
      expect(result.current.editingId).toBeNull();
      expect(result.current.formData).toEqual({
        name: "",
        description: "",
        phone: "",
        instagram: "",
        imageUrl: "",
      });
    });

    it("should fetch shop data on mount when authenticated", async () => {
      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetShopByUserId).toHaveBeenCalledTimes(1);
      expect(result.current.barbers).toHaveLength(1);
      expect(result.current.barbers[0]).toMatchObject({
        id: mockBarber.id,
        name: mockBarber.name,
        description: mockBarber.description,
        phone: mockBarber.phone,
        instagram: mockBarber.instagram,
        imageUrl: mockBarber.imageUrl,
      });
    });

    it("should handle empty shop data gracefully", async () => {
      mockGetShopByUserId.mockResolvedValue(null);

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.barbers).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith("No shop found for current authenticated user.");
    });

    it("should handle fetch errors and show error toast", async () => {
      const error = new Error("Network error");
      mockGetShopByUserId.mockRejectedValue(error);

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching shop data:", error);
      expect(mockToast.error).toHaveBeenCalledWith("Error loading barbers");
      expect(result.current.barbers).toEqual([]);
    });
  });

  describe("Opening add/edit drawer", () => {
    it("should open drawer in add mode with clean form", async () => {
      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      expect(result.current.isDrawerOpen).toBe(true);
      expect(result.current.editingId).toBeNull();
      expect(result.current.selectedCountry).toBe("PT");
      expect(result.current.formData).toEqual({
        name: "",
        description: "",
        phone: "",
        instagram: "",
        imageUrl: "",
      });
    });

    it("should open drawer in edit mode with barber data", async () => {
      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(mockBarber);
      });

      expect(result.current.isDrawerOpen).toBe(true);
      expect(result.current.editingId).toBe("barber-1");
      expect(result.current.selectedCountry).toBe("PT");
      expect(result.current.formData).toEqual({
        name: "Carlos Silva",
        description: "Specialist",
        phone: "912345678", // Local phone without dial code
        instagram: "@carlos",
        imageUrl: "https://example.com/carlos.jpg",
      });
    });

    it("should detect country from phone number when editing", async () => {
      const brazilBarber: Barber = {
        ...mockBarber,
        phone: "+5511987654321",
      };

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(brazilBarber);
      });

      expect(result.current.selectedCountry).toBe("BR");
      expect(result.current.formData.phone).toBe("11987654321");
    });

    it("should default to PT when phone has no dial code", async () => {
      const noDialCodeBarber: Barber = {
        ...mockBarber,
        phone: "912345678",
      };

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(noDialCodeBarber);
      });

      expect(result.current.selectedCountry).toBe("PT");
      expect(result.current.formData.phone).toBe("912345678");
    });

    it("should handle barber with null phone", async () => {
      const noPhoneBarber: Barber = {
        ...mockBarber,
        phone: null,
      };

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(noPhoneBarber);
      });

      expect(result.current.selectedCountry).toBe("PT");
      expect(result.current.formData.phone).toBe("");
    });
  });

  describe("Form submission - create barber", () => {
    it("should create barber successfully with valid data", async () => {
      mockCreateBarber.mockResolvedValue({ barber: mockFullBarber });

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "João Costa",
          description: "Senior Barber",
          phone: "913456789",
          instagram: "@joao",
          imageUrl: "",
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

      expect(mockCreateBarber).toHaveBeenCalledWith({
        name: "João Costa",
        description: "Senior Barber",
        phone: "+351913456789", // Full international number
        instagram: "@joao",
        imageUrl: "",
      });
      expect(mockToast.success).toHaveBeenCalledWith("Barber created");
      expect(result.current.isDrawerOpen).toBe(false);
    });

    it("should validate name is not empty", async () => {
      const { result } = renderHook(() => useBarbersPage());

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
          phone: "912345678",
          instagram: "",
          imageUrl: "",
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Name is required");
      expect(mockCreateBarber).not.toHaveBeenCalled();
    });

    it("should validate phone is not empty", async () => {
      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "João Costa",
          description: "",
          phone: "   ", // Whitespace only
          instagram: "",
          imageUrl: "",
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Phone is required");
      expect(mockCreateBarber).not.toHaveBeenCalled();
    });

    it("should validate phone format for selected country", async () => {
      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "João Costa",
          description: "",
          phone: "123", // Invalid for PT
          instagram: "",
          imageUrl: "",
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith(expect.stringContaining("Invalid format for Portugal"));
      expect(mockCreateBarber).not.toHaveBeenCalled();
    });

    it("should handle creation errors from server action", async () => {
      mockCreateBarber.mockResolvedValue({ error: "Barber limit reached" });

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "João Costa",
          description: "",
          phone: "913456789",
          instagram: "",
          imageUrl: "",
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Barber limit reached");
      expect(result.current.isDrawerOpen).toBe(true); // Drawer stays open on error
    });
  });

  describe("Form submission - update barber", () => {
    it("should update barber successfully", async () => {
      mockUpdateBarber.mockResolvedValue({ barber: mockFullBarber });

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(mockBarber);
      });

      act(() => {
        result.current.setFormData({
          ...result.current.formData,
          name: "Carlos Silva Updated",
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

      expect(mockUpdateBarber).toHaveBeenCalledWith("barber-1", {
        name: "Carlos Silva Updated",
        description: "Specialist",
        phone: "+351912345678",
        instagram: "@carlos",
        imageUrl: "https://example.com/carlos.jpg",
      });
      expect(mockToast.success).toHaveBeenCalledWith("Barber updated");
      expect(result.current.isDrawerOpen).toBe(false);
    });

    it("should handle update errors from server action", async () => {
      mockUpdateBarber.mockResolvedValue({ error: "Update failed" });

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(mockBarber);
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

  describe("Delete barber", () => {
    it("should delete barber successfully when confirmed", async () => {
      mockDeleteBarber.mockResolvedValue({ success: true });
      window.confirm = jest.fn(() => true);

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDelete("barber-1");
      });

      expect(window.confirm).toHaveBeenCalledWith("Are you sure?");
      expect(mockDeleteBarber).toHaveBeenCalledWith("barber-1");
      expect(mockToast.success).toHaveBeenCalledWith("Barber deleted");
    });

    it("should not delete when user cancels confirmation", async () => {
      window.confirm = jest.fn(() => false);

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDelete("barber-1");
      });

      expect(window.confirm).toHaveBeenCalledWith("Are you sure?");
      expect(mockDeleteBarber).not.toHaveBeenCalled();
      expect(mockToast.success).not.toHaveBeenCalled();
    });

    it("should handle delete errors from server action", async () => {
      mockDeleteBarber.mockResolvedValue({ error: "Cannot delete last barber" });
      window.confirm = jest.fn(() => true);

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDelete("barber-1");
      });

      expect(mockToast.error).toHaveBeenCalledWith("Cannot delete last barber");
    });

    it("should handle unexpected errors during delete", async () => {
      mockDeleteBarber.mockRejectedValue(new Error("Network error"));
      window.confirm = jest.fn(() => true);

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDelete("barber-1");
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Delete error:", expect.any(Error));
      expect(mockToast.error).toHaveBeenCalledWith("Network error"); // extractErrorMessage uses Error.message, not fallback
    });
  });

  describe("Image upload", () => {
    it("should upload image successfully for existing barber", async () => {
      const mockFile = new File(["image"], "barber.jpg", { type: "image/jpeg" });
      const mockUrl = "https://storage.example.com/barber-new.jpg";
      
      mockUploadImage.mockResolvedValue(mockUrl);
      mockUpdateBarber.mockResolvedValue({ barber: mockFullBarber });

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenEdit(mockBarber);
      });

      await act(async () => {
        const event = {
          target: { files: [mockFile] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await result.current.handleImageUpload(event);
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
      });

      expect(mockUploadImage).toHaveBeenCalledWith(mockFile, "barbers");
      expect(mockUpdateBarber).toHaveBeenCalledWith("barber-1", {
        imageUrl: mockUrl,
      });
      expect(mockToast.success).toHaveBeenCalledWith("Image uploaded", { id: "toast-id" });
    });

    it("should upload image for new barber without updating", async () => {
      const mockFile = new File(["image"], "barber.jpg", { type: "image/jpeg" });
      const mockUrl = "https://storage.example.com/barber-new.jpg";
      
      mockUploadImage.mockResolvedValue(mockUrl);

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      await act(async () => {
        const event = {
          target: { files: [mockFile] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await result.current.handleImageUpload(event);
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
      });

      expect(mockUploadImage).toHaveBeenCalledWith(mockFile, "barbers");
      expect(mockUpdateBarber).not.toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith("Image uploaded (new)", { id: "toast-id" });
      expect(result.current.formData.imageUrl).toBe(mockUrl);
    });

    it("should reject non-image files", async () => {
      const mockFile = new File(["data"], "document.pdf", { type: "application/pdf" });

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const event = {
          target: { files: [mockFile] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await result.current.handleImageUpload(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Invalid image type");
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it("should reject files larger than 2MB", async () => {
      const largeFile = new File([new ArrayBuffer(3 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const event = {
          target: { files: [largeFile] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await result.current.handleImageUpload(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Image too large");
      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it("should handle upload errors gracefully", async () => {
      const mockFile = new File(["image"], "barber.jpg", { type: "image/jpeg" });
      mockUploadImage.mockRejectedValue(new Error("Upload failed"));

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const event = {
          target: { files: [mockFile] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await result.current.handleImageUpload(event);
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Upload error:", expect.any(Error));
      expect(mockToast.error).toHaveBeenCalledWith("Upload failed", { id: "toast-id" });
    });

    it("should do nothing when no file is selected", async () => {
      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const event = {
          target: { files: [] },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await result.current.handleImageUpload(event);
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
      expect(mockToast.error).not.toHaveBeenCalled();
    });
  });

  describe("Utility functions", () => {
    it("should generate initials correctly", async () => {
      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getInitials("Carlos Silva")).toBe("CS");
      expect(result.current.getInitials("João")).toBe("J"); // Single name - first letter only
      expect(result.current.getInitials("Ana Maria Costa")).toBe("AM"); // First 2 initials only
      expect(result.current.getInitials("")).toBe(""); // Empty string
    });
  });

  describe("Auth guard", () => {
    it("should show auth error when submitting while not authenticated", async () => {
      // Mock unauthenticated state
      const { useAuth } = require("@/contexts/AuthContext");
      useAuth.mockReturnValue({ isAuthenticated: false });

      const { result } = renderHook(() => useBarbersPage());

      // Don't wait for isLoading to be false - hook returns early when not authenticated
      // Just wait a bit for the hook to initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "Test",
          description: "",
          phone: "912345678",
          instagram: "",
          imageUrl: "",
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Not authenticated");
      expect(mockCreateBarber).not.toHaveBeenCalled();

      // Restore mock
      useAuth.mockReturnValue({ isAuthenticated: true });
    });

    it("should show shop error when no shop exists", async () => {
      mockGetShopByUserId.mockResolvedValue(null);

      const { result } = renderHook(() => useBarbersPage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.handleOpenAdd();
      });

      act(() => {
        result.current.setFormData({
          name: "Test",
          description: "",
          phone: "912345678",
          instagram: "",
          imageUrl: "",
        });
      });

      await act(async () => {
        const event = new Event("submit") as unknown as React.FormEvent;
        event.preventDefault = jest.fn();
        await result.current.handleSubmit(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("No shop found");
      expect(mockCreateBarber).not.toHaveBeenCalled();
    });
  });
});
