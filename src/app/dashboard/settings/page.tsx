"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { DashboardManagementLayout } from "../_components/DashboardManagementLayout";
import { getShopByUserId } from "@/app/_actions/dashboard-barbers";
import { updateShop } from "@/app/_actions/dashboard-settings";
import { StorageService } from "@/services/storageService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShopData {
  id: string;
  name: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  instagram: string | null;
  logoUrl: string | null;
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

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    instagram: "",
    logoUrl: "",
  });

  const fetchShopData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const shopData = await getShopByUserId();
      if (shopData) {
        const typedShopData = shopData as ShopData;
        setShop(typedShopData);
        setFormData({
          name: typedShopData.name || "",
          description: typedShopData.description || "",
          address: typedShopData.address || "",
          phone: typedShopData.phone || "",
          instagram: typedShopData.instagram || "",
          logoUrl: typedShopData.logoUrl || "",
        });
      } else {
        setShop(null);
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t.dashboard.settings.errorImageType);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t.dashboard.settings.errorImageSize);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(t.dashboard.settings.uploadingLogo);
    
    try {
      const publicUrl = await StorageService.uploadImage(file, 'shops');
      
      // Immediately update the shop with the new logo URL
      if (shop?.id) {
        const result = await updateShop({ logoUrl: publicUrl });
        if (result.error) throw new Error(result.error);
        
        setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
        toast.success(t.dashboard.settings.logoUploaded, { id: toastId });
        fetchShopData(); // Refresh data to ensure consistency
      } else {
        throw new Error("Shop ID not found.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t.dashboard.settings.uploadFailed, { id: toastId });
    } finally {
      setIsSubmitting(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.id) return;

    setIsSubmitting(true);
    const toastId = toast.loading(t.dashboard.settings.savingSettings);

    try {
      const result = await updateShop(formData);
      if (result.error) throw new Error(result.error);
      
      toast.success(t.dashboard.settings.settingsSaved, { id: toastId });
      fetchShopData(); // Refetch to get the latest data
    } catch (error: unknown) {
      console.error("Save error:", error);
      toast.error(extractErrorMessage(error, t.dashboard.settings.saveFailed), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardManagementLayout 
      title={t.dashboard.settings.title} 
      subtitle={t.dashboard.settings.subtitle}
    >
      <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo Section */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t.dashboard.settings.shopLogo}
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center group">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-300">{t.dashboard.settings.logoPlaceholder}</span>
                  )}
                  {isSubmitting && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <h4 className="font-bold text-slate-900 dark:text-slate-50">{t.dashboard.settings.uploadBranding}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.dashboard.settings.logoHint}</p>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="rounded-xl font-bold h-10"
                  >
                    {t.dashboard.settings.selectImage}
                  </Button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {t.dashboard.settings.shopName}
                </label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl"
                  placeholder={t.dashboard.settings.shopNamePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {t.dashboard.settings.description}
                </label>
                <Input 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-12 rounded-xl"
                  placeholder={t.dashboard.settings.descriptionPlaceholder}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t.dashboard.settings.phoneNumber}
                  </label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl"
                    placeholder={t.dashboard.settings.phonePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t.dashboard.settings.instagramAccount}
                  </label>
                  <Input 
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="h-12 rounded-xl"
                    placeholder={t.dashboard.settings.instagramPlaceholder}
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20"
            >
              {t.dashboard.settings.saveSettings}
            </Button>
          </form>
        )}
      </div>
    </DashboardManagementLayout>
  );
}
