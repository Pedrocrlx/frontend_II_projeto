"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HexColorPicker } from 'react-colorful';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import type { RootState } from '@/lib/store';
import { 
  setPrimaryColor, 
  setSecondaryColor, 
  setLogoUrl, 
  loadTheme, 
  markAsSaved,
  resetTheme 
} from '@/lib/themeSlice';
import { saveThemeCustomization, loadThemeCustomization, resetThemeCustomization } from '@/app/_actions/dashboard-theme';
import { toast } from 'sonner';
import { RefreshCw, Save } from 'lucide-react';
import { authService } from '@/services/authService';
import { StorageService } from '@/services/storageService';
import { DashboardManagementLayout } from '@/app/dashboard/_components/DashboardManagementLayout';
import { useI18n } from '@/contexts/I18nContext';

export default function CustomizePage() {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const theme = useAppSelector((state: RootState) => state.theme);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get auth token on mount
  useEffect(() => {
    const getToken = async () => {
      const session = await authService.getSession();
      if (session?.access_token) {
        setAuthToken(session.access_token);
      }
    };
    getToken();
  }, []);

  // Load theme on mount
  useEffect(() => {
    const loadCurrentTheme = async () => {
      if (!authToken) return;
      
      setIsLoading(true);
      try {
        const result = await loadThemeCustomization(authToken);
        if (result.status === 200 && result.data) {
          dispatch(loadTheme({
            colors: {
              primaryColor: result.data.primaryColor,
              secondaryColor: result.data.secondaryColor,
            },
            logoUrl: result.data.logoUrl,
          }));
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
        toast.error(t.dashboard.customize.errorLoadTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentTheme();
  }, [authToken, dispatch]);

  // Handle logo file selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save theme changes
  const handleSave = async () => {
    if (!authToken) {
      toast.error(t.dashboard.customize.errorAuthRequired);
      return;
    }

    setIsSaving(true);
    try {
      let finalLogoUrl = theme.logoUrl;

      // Upload logo if a new one was selected
      if (logoFile) {
        try {
          const uploadResult = await StorageService.uploadImage(logoFile, 'shops');
          finalLogoUrl = uploadResult;
          dispatch(setLogoUrl(finalLogoUrl));
        } catch (error) {
          console.error('Failed to upload logo:', error);
          toast.error(t.dashboard.customize.errorUploadLogo);
          setIsSaving(false);
          return;
        }
      }

      // Save theme to database
      console.log('Saving theme with colors:', {
        primaryColor: theme.colors.primaryColor,
        secondaryColor: theme.colors.secondaryColor,
        logoUrl: finalLogoUrl,
      });
      
      const result = await saveThemeCustomization(authToken, {
        primaryColor: theme.colors.primaryColor,
        secondaryColor: theme.colors.secondaryColor,
        logoUrl: finalLogoUrl,
      });

      console.log('Save result:', result);

      if (result.status === 200) {
        dispatch(markAsSaved());
        toast.success(t.dashboard.customize.successThemeSaved);
        setLogoFile(null);
        setLogoPreview(null);
        
        // Force page reload to see changes immediately
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      toast.error(t.dashboard.customize.errorSaveTheme);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset theme
  const handleReset = async () => {
    if (!authToken) {
      toast.error(t.dashboard.customize.errorAuthRequired);
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetThemeCustomization(authToken);
      if (result.status === 200) {
        dispatch(resetTheme());
        setLogoFile(null);
        setLogoPreview(null);
        toast.success(t.dashboard.customize.successThemeReset);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to reset theme:', error);
      toast.error(t.dashboard.customize.errorResetTheme);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !theme.colors.primaryColor) {
    return (
      <DashboardManagementLayout
        title={t.dashboard.customize.title}
        subtitle={t.dashboard.customize.subtitle}
        category={t.dashboard.customize.category}
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>{t.dashboard.customize.loadingTheme}</span>
          </div>
        </div>
      </DashboardManagementLayout>
    );
  }

  return (
    <DashboardManagementLayout
      title={t.dashboard.customize.title}
      subtitle={t.dashboard.customize.subtitle}
      category={t.dashboard.customize.category}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} variant={theme.hasUnsavedChanges ? "default" : "outline"}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? t.dashboard.customize.saving : t.dashboard.customize.saveChanges}
            </Button>
            {theme.hasUnsavedChanges && (
              <span className="text-sm text-amber-600 flex items-center">
                {t.dashboard.customize.unsavedChanges}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.customize.colorsTitle}</CardTitle>
              <CardDescription>
                {t.dashboard.customize.colorsDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primary-color">{t.dashboard.customize.primaryColor}</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    value={theme.colors.primaryColor}
                    onChange={(e) => dispatch(setPrimaryColor(e.target.value))}
                    placeholder="#000000"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                    style={{ backgroundColor: theme.colors.primaryColor }}
                    className="w-10 h-10 border"
                  >
                    <span className="sr-only">{t.dashboard.customize.pickColor}</span>
                  </Button>
                </div>
                {showPrimaryPicker && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={theme.colors.primaryColor}
                      onChange={(color) => dispatch(setPrimaryColor(color))}
                    />
                  </div>
                )}
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label htmlFor="secondary-color">{t.dashboard.customize.secondaryColor}</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    value={theme.colors.secondaryColor}
                    onChange={(e) => dispatch(setSecondaryColor(e.target.value))}
                    placeholder="#666666"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                    style={{ backgroundColor: theme.colors.secondaryColor }}
                    className="w-10 h-10 border"
                  >
                    <span className="sr-only">{t.dashboard.customize.pickColor}</span>
                  </Button>
                </div>
                {showSecondaryPicker && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={theme.colors.secondaryColor}
                      onChange={(color) => dispatch(setSecondaryColor(color))}
                    />
                  </div>
                )}
              </div>

              <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.dashboard.customize.resetToDefault}
              </Button>
            </CardContent>
          </Card>

          {/* Logo Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.customize.logoTitle}</CardTitle>
              <CardDescription>
                {t.dashboard.customize.logoDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Logo */}
              {theme.logoUrl && !logoPreview && (
                <div className="space-y-2">
                  <Label>{t.dashboard.customize.currentLogo}</Label>
                  <div className="w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={theme.logoUrl}
                      alt={t.dashboard.customize.currentLogoAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Logo Preview */}
              {logoPreview && (
                <div className="space-y-2">
                  <Label>{t.dashboard.customize.newLogoPreview}</Label>
                  <div className="w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={logoPreview}
                      alt={t.dashboard.customize.logoPreviewAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload Input */}
              <div className="space-y-2">
                <Label htmlFor="logo-upload">{t.dashboard.customize.uploadNewLogo}</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardManagementLayout>
  );
}
