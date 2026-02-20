import api from './api';

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  barberShopId: string;
  duration: number; 
}

export interface Barber {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string | null;
}

export interface BarberShopData {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  services: Service[];
  barbers: Barber[];
  duration: number;  
}

export const BarberService = {
  getProfileBySlug: async (slug: string, apiClient = api) => {
    try {
      if (!slug || slug === "favicon.ico") return null;

      const { data } = await apiClient.get<BarberShopData>(`/barber/${slug}`);
      return data;
    } catch (error) {
      console.error("Erro ao buscar barbearia:", slug);
      return null;
    }
  },
};