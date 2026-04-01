"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  getShopByUserId,
  createService,
  updateService,
  deleteService,
  type ServiceData,
} from "@/app/_actions/dashboard-services";
import { toast } from "sonner";

interface ShopWithServices {
  id: string;
  services: Service[];
}

interface ActionErrorResult {
  error: string;
}

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
};

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return fallback;
}

export function useServicesPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  const [shop, setShop] = useState<ShopWithServices | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceData>({
    name: "",
    description: "",
    price: 15,
    duration: 30,
  });

  const fetchShopData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const shopData = await getShopByUserId();
      if (shopData) {
        const typedShopData = shopData as ShopWithServices;
        setShop(typedShopData);
        setServices(typedShopData.services);
      } else {
        setShop(null);
        setServices([]);
        console.warn("No shop found for current authenticated user.");
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast.error(t.dashboard.services.errorTitle);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, t.dashboard.services.errorTitle]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleOpenAdd = useCallback(() => {
    setEditingId(null);
    setFormData({ name: "", description: "", price: 15, duration: 30 });
    setIsDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: Number(service.price),
      duration: service.duration,
    });
    setIsDrawerOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isAuthenticated) {
        toast.error(t.dashboard.services.errorNotAuth);
        return;
      }

      if (!shop?.id) {
        toast.error(t.dashboard.services.errorNoShop);
        return;
      }

      if (!formData.name.trim()) {
        toast.error(t.dashboard.services.errorNoName);
        return;
      }

      setIsSubmitting(true);
      try {
        if (editingId) {
          const result = await updateService(editingId, formData);
          if (result.error) throw new Error(result.error);
          toast.success(t.dashboard.services.successUpdated);
        } else {
          const result = await createService(formData);
          if (result.error) throw new Error(result.error);
          toast.success(t.dashboard.services.successCreated);
        }
        setIsDrawerOpen(false);
        fetchShopData();
      } catch (error: unknown) {
        console.error("Submission error:", error);
        toast.error(extractErrorMessage(error, t.dashboard.services.errorGeneric));
      } finally {
        setIsSubmitting(false);
      }
    },
    [isAuthenticated, shop?.id, formData, editingId, fetchShopData, t.dashboard.services]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm(t.dashboard.services.deleteConfirm)) return;

      try {
        const result = await deleteService(id);
        if ((result as ActionErrorResult).error) {
          throw new Error((result as ActionErrorResult).error);
        }
        toast.success(t.dashboard.services.successDeleted);
        fetchShopData();
      } catch (error: unknown) {
        console.error("Delete error:", error);
        toast.error(extractErrorMessage(error, t.dashboard.services.errorDelete));
      }
    },
    [fetchShopData, t.dashboard.services]
  );

  return {
    services,
    isLoading,
    isDrawerOpen,
    isSubmitting,
    editingId,
    formData,
    setIsDrawerOpen,
    setFormData,
    handleOpenAdd,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
  };
}
