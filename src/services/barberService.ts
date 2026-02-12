import api from './api';

export interface BarberShopData {
  id: string;
  slug: string;
  name: string;
  // ... outros tipos
}

export const BarberService = {
  getProfileBySlug: async (slug: string) => {
    const { data } = await api.get<BarberShopData>(`/barber/${slug}`);
    return data;
  },
};