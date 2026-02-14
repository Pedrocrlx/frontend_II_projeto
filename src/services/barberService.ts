import api from './api';

export interface Service {
  id: string;
  name: string;
  price: number;
  barberShopId: string;
}

export interface BarberShopData {
  id: string;
  slug: string;
  name: string;
  services: Service[];
  // ... outros tipos
}

export const BarberService = {
  getProfileBySlug: async (slug: string) => {
    try {
      // Se o slug for inválido ou vazio, nem faz a chamada
      if (!slug || slug === "favicon.ico") return null;

      const { data } = await api.get<BarberShopData>(`/barber/${slug}`);
      return data;
    } catch (error) {
      // Em vez de crashar a app, apenas dizemos que não encontrámos nada
      console.error("Erro ao buscar barbearia:", slug);
      return null;
    }
  },
};