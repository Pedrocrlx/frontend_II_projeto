"use client";

import { useState, useEffect } from "react";
import { DashboardManagementLayout } from "../_components/DashboardManagementLayout";
import { BookingService } from "@/services/dashboardService";

export default function ServicesPage({ params }: { params: { slug: string } }) {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await BookingService.getBarberShopServices(params.slug);
        setServices(data || []);
      } catch (error) {
        console.error("Erro ao carregar os serviços:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [params.slug]);

  return (
    <DashboardManagementLayout 
      title="Services" 
      subtitle="Define your offerings, pricing, and durations."
    >
      <div>
        <h1 className="text-2xl font-bold mb-2">Services</h1>
        <p className="text-gray-600 mb-6">Manage your services, pricing, and durations.</p>
        
        {isLoading ? (
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            A carregar serviços...
          </div>
        ) : 
          <div className="space-y-4">
            {services.map((service: any) => (
              <div key={service.id} className="border border-slate-200 p-4 rounded-xl bg-white">
                <h2 className="font-bold text-lg">{service.name}</h2>
                <p className="text-slate-500 text-sm">{service.description}</p>
                <div className="mt-2 flex gap-4 text-sm font-medium">
                  <span className="bg-slate-100 px-2 py-1 rounded">Price: ${service.price}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">Duration: {service.duration} min</span>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500">
                Ainda não tem serviços configurados.
              </div>
            )}
          </div>
        }
      </div>
    </DashboardManagementLayout>
  );
}
