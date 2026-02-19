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
  imageUrl?: string | null;
  description?: string | null;
}

export interface BarberShopData {
  id: string;
  slug: string;
  name: string;
    services: Service[];
  barbers: Barber[];
  duration: number;  
}

export const BarberService = {
  getProfileBySlug: async (slug: string) => {
    try {
      if (!slug || slug === "favicon.ico") return null;

      const { data } = await api.get<BarberShopData>(`/barber/${slug}`);
      return data;
    } catch (error) {
      console.error("Erro ao buscar barbearia:", slug);
      return null;
    }
  },
};