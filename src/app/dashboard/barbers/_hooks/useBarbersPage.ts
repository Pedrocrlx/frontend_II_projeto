"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  getShopByUserId,
  createBarber,
  updateBarber,
  deleteBarber,
  type BarberData,
} from "@/app/_actions/dashboard-barbers";
import { StorageService } from "@/services/storageService";
import { toast } from "sonner";
import { COUNTRY_CONFIGS, validateInternationalPhone } from "@/lib/utils/phone-validation";

interface ActionErrorResult {
  error: string;
}

export type Barber = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  instagram: string | null;
  imageUrl: string | null;
};

interface ShopWithBarbers {
  id: string;
  barbers: Barber[];
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return fallback;
}

export function useBarbersPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  const [shop, setShop] = useState<ShopWithBarbers | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("PT");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BarberData>({
    name: "",
    description: "",
    phone: "",
    instagram: "",
    imageUrl: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchShopData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const shopData = await getShopByUserId();
      if (shopData) {
        const typedShopData = shopData as ShopWithBarbers;
        setShop(typedShopData);
        setBarbers(typedShopData.barbers);
      } else {
        setShop(null);
        setBarbers([]);
        console.warn("No shop found for current authenticated user.");
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast.error(t.dashboard.barbers.errorTitle);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, t.dashboard.barbers.errorTitle]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleOpenAdd = useCallback(() => {
    setEditingId(null);
    setFormData({ name: "", description: "", phone: "", instagram: "", imageUrl: "" });
    setSelectedCountry("PT");
    setIsDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((barber: Barber) => {
    setEditingId(barber.id);

    let detectedCountry = "PT";
    let localPhone = barber.phone || "";

    if (barber.phone) {
      for (const [countryCode, config] of Object.entries(COUNTRY_CONFIGS)) {
        if (barber.phone.startsWith(config.dialCode)) {
          detectedCountry = countryCode;
          localPhone = barber.phone.substring(config.dialCode.length);
          break;
        }
      }
    }

    setSelectedCountry(detectedCountry);
    setFormData({
      name: barber.name,
      description: barber.description || "",
      phone: localPhone,
      instagram: barber.instagram || "",
      imageUrl: barber.imageUrl || "",
    });
    setIsDrawerOpen(true);
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error(t.dashboard.common.errorImageType);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error(t.dashboard.common.errorImageSize);
        return;
      }

      setIsUploading(true);
      const toastId = toast.loading(t.dashboard.common.uploadingImage);

      try {
        const publicUrl = await StorageService.uploadImage(file, "barbers");
        setFormData((prev) => ({ ...prev, imageUrl: publicUrl }));

        if (editingId) {
          const result = await updateBarber(editingId, { imageUrl: publicUrl });
          if (result.error) throw new Error(result.error);
          toast.success(t.dashboard.common.imageUploaded, { id: toastId });
          fetchShopData();
        } else {
          toast.success(t.dashboard.common.imageUploadedNew, { id: toastId });
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(t.dashboard.common.uploadFailed, { id: toastId });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [editingId, fetchShopData, t.dashboard.common]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isAuthenticated) {
        toast.error(t.dashboard.barbers.errorNotAuth);
        return;
      }

      if (!shop?.id) {
        toast.error(t.dashboard.barbers.errorNoShop);
        return;
      }

      if (!formData.name.trim()) {
        toast.error(t.dashboard.barbers.errorNoName);
        return;
      }

      if (!formData.phone.trim()) {
        toast.error(t.dashboard.barbers.phoneRequired);
        return;
      }

      const phoneValidation = validateInternationalPhone(formData.phone, selectedCountry);
      if (!phoneValidation.isValid) {
        toast.error(phoneValidation.error || "Invalid phone number format");
        return;
      }

      setIsSubmitting(true);
      try {
        const dataToSubmit = {
          ...formData,
          phone: phoneValidation.fullNumber || formData.phone,
        };

        if (editingId) {
          const result = await updateBarber(editingId, dataToSubmit);
          if (result.error) throw new Error(result.error);
          toast.success(t.dashboard.barbers.successUpdated);
        } else {
          const result = await createBarber(dataToSubmit);
          if (result.error) throw new Error(result.error);
          toast.success(t.dashboard.barbers.successCreated);
        }
        setIsDrawerOpen(false);
        fetchShopData();
      } catch (error: unknown) {
        console.error("Submission error:", error);
        toast.error(extractErrorMessage(error, t.dashboard.barbers.errorGeneric));
      } finally {
        setIsSubmitting(false);
      }
    },
    [isAuthenticated, shop?.id, formData, editingId, fetchShopData, selectedCountry, t.dashboard.barbers]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm(t.dashboard.barbers.deleteConfirm)) return;

      try {
        const result = await deleteBarber(id);
        if ((result as ActionErrorResult).error) {
          throw new Error((result as ActionErrorResult).error);
        }
        toast.success(t.dashboard.barbers.successDeleted);
        fetchShopData();
      } catch (error: unknown) {
        console.error("Delete error:", error);
        toast.error(extractErrorMessage(error, t.dashboard.barbers.errorDelete));
      }
    },
    [fetchShopData, t.dashboard.barbers]
  );

  const getInitials = useCallback((name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  return {
    barbers,
    isLoading,
    isDrawerOpen,
    isSubmitting,
    isUploading,
    selectedCountry,
    fileInputRef,
    editingId,
    formData,
    setIsDrawerOpen,
    setSelectedCountry,
    setFormData,
    handleOpenAdd,
    handleOpenEdit,
    handleImageUpload,
    handleSubmit,
    handleDelete,
    getInitials,
  };
}
