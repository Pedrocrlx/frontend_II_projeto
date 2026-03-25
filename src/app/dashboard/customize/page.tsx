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
import { RefreshCw, Save, Eye } from 'lucide-react';
import { authService } from '@/services/authService';
import { StorageService } from '@/services/storageService';
import { DashboardManagementLayout } from '@/app/dashboard/_components/DashboardManagementLayout';

export default function CustomizePage() {
  const dispatch = useAppDispatch();
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
        toast.error('Failed to load theme configuration');
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
      toast.error('Authentication required');
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
          toast.error('Failed to upload logo');
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
        toast.success('Theme saved successfully!');
        setLogoFile(null);
        setLogoPreview(null);
        
        // Force page reload to see changes immediately
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset theme
  const handleReset = async () => {
    if (!authToken) {
      toast.error('Authentication required');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetThemeCustomization(authToken);
      if (result.status === 200) {
        dispatch(resetTheme());
        setLogoFile(null);
        setLogoPreview(null);
        toast.success('Theme reset to defaults');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to reset theme:', error);
      toast.error('Failed to reset theme');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !theme.colors.primaryColor) {
    return (
      <DashboardManagementLayout
        title="Theme Customization"
        subtitle="Customize the appearance of your barbershop's public page"
        category="Customization"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading theme...</span>
          </div>
        </div>
      </DashboardManagementLayout>
    );
  }

  return (
    <DashboardManagementLayout
      title="Theme Customization"
      subtitle="Customize the appearance of your barbershop's public page"
      category="Customization"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} variant={theme.hasUnsavedChanges ? "default" : "outline"}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            {theme.hasUnsavedChanges && (
              <span className="text-sm text-amber-600 flex items-center">
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>
                Choose colors that will be applied to page backgrounds and interactive elements. Text colors remain standard for accessibility.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
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
                    <span className="sr-only">Pick color</span>
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
                <Label htmlFor="secondary-color">Secondary Color</Label>
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
                    <span className="sr-only">Pick color</span>
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
                Reset to Default
              </Button>
            </CardContent>
          </Card>

          {/* Logo Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Upload your barbershop logo (recommended size: 200x200px)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Logo */}
              {theme.logoUrl && !logoPreview && (
                <div className="space-y-2">
                  <Label>Current Logo</Label>
                  <div className="w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={theme.logoUrl}
                      alt="Current logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Logo Preview */}
              {logoPreview && (
                <div className="space-y-2">
                  <Label>New Logo Preview</Label>
                  <div className="w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload Input */}
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Upload New Logo</Label>
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

          {/* Live Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See how your changes will look on the public page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="p-6 rounded-lg border-2 border-dashed"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primaryColor}08, ${theme.colors.primaryColor}03)`,
                } as React.CSSProperties}
              >
                <div className="flex items-center gap-4 mb-4">
                  {(logoPreview || theme.logoUrl) && (
                    <div
                      className="w-12 h-12 rounded object-cover flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: theme.colors.primaryColor }}
                    >
                      <img
                        src={logoPreview || theme.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Your Barbershop Name
                    </h3>
                    <p className="text-sm text-slate-600">
                      Professional barbershop services
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    size="sm"
                    style={{ 
                      backgroundColor: theme.colors.primaryColor,
                      color: 'white'
                    }}
                  >
                    Book Appointment
                  </Button>
                  <p className="text-xs text-slate-500">
                    Custom colors are applied only to page backgrounds, buttons, and accents. All text uses standard colors for optimal readability and accessibility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardManagementLayout>
  );
}