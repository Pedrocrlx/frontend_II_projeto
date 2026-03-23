"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardManagementLayout } from "../_components/DashboardManagementLayout";
import { 
  getShopByUserId, 
  createService, 
  updateService, 
  deleteService,
  ServiceData 
} from "@/app/_actions/dashboard-services";
import { toast } from "sonner";
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

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: any; // Decimal from Prisma
  duration: number;
};

const PRICE_OPTIONS = [5, 10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100];
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function ServicesPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceData>({
    name: "",
    description: "",
    price: 15,
    duration: 30
  });

  const fetchShopData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const shopData = await getShopByUserId(user.id);
      if (shopData) {
        setShop(shopData);
        setServices(shopData.services);
      } else {
        console.warn("No shop found for user:", user.id);
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast.error("Failed to load services.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", price: 15, duration: 30 });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: Number(service.price),
      duration: service.duration
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("User not authenticated.");
      return;
    }

    if (!shop?.id) {
      toast.error("Shop not found. Please complete onboarding.");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a service name.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const result = await updateService(editingId, formData);
        if (result.error) throw new Error(result.error);
        toast.success("Service updated successfully!");
      } else {
        const result = await createService(shop.id, formData);
        if (result.error) throw new Error(result.error);
        toast.success("Service created successfully!");
      }
      setIsDrawerOpen(false);
      fetchShopData();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const result = await deleteService(id);
      if (result.error) throw new Error(result.error);
      toast.success("Service deleted.");
      fetchShopData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete service.");
    }
  };

  const selectBaseClass = "w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all font-medium appearance-none";

  return (
    <DashboardManagementLayout 
      title="Services" 
      subtitle="Manage your catalog, pricing, and durations."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {services.length} / 20 Services
            </h2>
          </div>
          <Button 
            onClick={handleOpenAdd}
            disabled={services.length >= 20}
            className="rounded-xl font-bold gap-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Add Service
          </Button>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-50 dark:bg-slate-900/40 animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 mb-4 font-medium">No services configured yet.</p>
            <Button variant="outline" onClick={handleOpenAdd} className="rounded-xl font-bold">
              Create your first service
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-slate-50 truncate pr-8">
                    {service.name}
                  </h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEdit(service)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 h-10">
                  {service.description || "No description provided."}
                </p>

                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-black">
                    ${Number(service.price).toFixed(2)}
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg text-sm font-bold">
                    {service.duration} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="sm:max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black">{editingId ? "Edit Service" : "New Service"}</DrawerTitle>
            <DrawerDescription className="font-medium">
              {editingId ? "Update your service details below." : "Add a new offering to your barbershop menu."}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Service Name *</label>
              <Input 
                placeholder="e.g. Premium Haircut" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description (Optional)</label>
              <Input 
                placeholder="Include details about the service..." 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Price ($) *</label>
                <div className="relative">
                  <select 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className={selectBaseClass}
                  >
                    {PRICE_OPTIONS.map((p) => (
                      <option key={p} value={p}>${p}.00</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration *</label>
                <div className="relative">
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className={selectBaseClass}
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <DrawerFooter className="px-0 pt-6">
              <Button type="submit" disabled={isSubmitting} className="w-full font-bold h-12 rounded-xl text-base shadow-lg shadow-blue-500/20">
                {isSubmitting ? "Processing..." : editingId ? "Save Changes" : "Create Service"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full font-bold h-12 rounded-xl">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </DashboardManagementLayout>
  );
}
