"use client";

import { useCallback } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { DashboardManagementLayout } from "../_components/DashboardManagementLayout";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerClose 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { COUNTRY_CONFIGS } from "@/lib/utils/phone-validation";
import { useBarbersPage } from "./_hooks/useBarbersPage";

// --- Icons ---
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function BarbersPage() {
  const { t } = useI18n();
  const {
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
  } = useBarbersPage();

  return (
    <DashboardManagementLayout 
      title={t.dashboard.barbers.title} 
      subtitle={t.dashboard.barbers.subtitle}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {barbers.length} / 10 {t.dashboard.barbers.counter}
            </h2>
          </div>
          <Button 
            onClick={handleOpenAdd}
            disabled={barbers.length >= 10}
            className="rounded-xl font-bold gap-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-4 h-4" />
            {t.dashboard.barbers.addButton}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-slate-50 dark:bg-slate-900/40 animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : barbers.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 mb-4 font-medium">{t.dashboard.barbers.noBarbers}</p>
            <Button variant="outline" onClick={handleOpenAdd} className="rounded-xl font-bold">
              {t.dashboard.barbers.createFirst}
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {barbers.map((barber) => (
              <div 
                key={barber.id} 
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                      {barber.imageUrl ? (
                        <img src={barber.imageUrl} alt={barber.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(barber.name)
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-50">
                      {barber.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEdit(barber)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={t.dashboard.common.edit}
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(barber.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t.dashboard.common.delete}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {barber.description && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {barber.description}
                  </p>
                )}

                <div className="space-y-3">
                  {barber.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">📞</span>
                      <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                        {barber.phone}
                      </span>
                    </div>
                  )}
                  {barber.instagram && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">📱</span>
                      <a 
                        href={`https://instagram.com/${barber.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                      >
                        {barber.instagram}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="sm:max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black">
              {editingId ? t.dashboard.barbers.formTitleEdit : t.dashboard.barbers.formTitleNew}
            </DrawerTitle>
            <DrawerDescription className="font-medium">
              {editingId ? t.dashboard.barbers.formDescEdit : t.dashboard.barbers.formDescNew}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.dashboard.barbers.photo}
              </label>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center relative">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Barber Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{t.dashboard.common.noPhoto}</span>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-slate-500">{t.dashboard.common.maxSize}</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isSubmitting}
                    className="h-8 text-xs font-bold rounded-lg"
                  >
                    {formData.imageUrl ? t.dashboard.common.changePhoto : t.dashboard.common.uploadPhoto}
                  </Button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.dashboard.barbers.name}
              </label>
              <Input 
                placeholder={t.dashboard.barbers.namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.dashboard.barbers.description}
              </label>
              <Input 
                placeholder={t.dashboard.barbers.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.dashboard.barbers.phone}
              </label>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <div>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="h-11 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-medium">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(COUNTRY_CONFIGS).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} ({country.dialCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input 
                  placeholder={COUNTRY_CONFIGS[selectedCountry].placeholder}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  maxLength={COUNTRY_CONFIGS[selectedCountry].maxLength}
                  className="h-11 rounded-xl"
                />
              </div>
              <p className="text-xs text-slate-500">
                Example: {COUNTRY_CONFIGS[selectedCountry].dialCode} {COUNTRY_CONFIGS[selectedCountry].placeholder}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.dashboard.barbers.instagram}
              </label>
              <Input 
                placeholder={t.dashboard.barbers.instagramPlaceholder}
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            <DrawerFooter className="px-0 pt-6">
              <Button type="submit" disabled={isSubmitting || isUploading} className="w-full font-bold h-12 rounded-xl text-base shadow-lg shadow-blue-500/20">
                {isSubmitting ? t.dashboard.barbers.processing : editingId ? t.dashboard.barbers.saveChanges : t.dashboard.barbers.createBarber}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full font-bold h-12 rounded-xl">
                  {t.dashboard.barbers.cancel}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </DashboardManagementLayout>
  );
}
