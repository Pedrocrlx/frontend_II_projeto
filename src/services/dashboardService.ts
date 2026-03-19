import api from "./api";

export interface BarberShopServices {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  duration: number;
}

export const BookingService = {
  getBarberShopServices: async (slug: string, apiClient = api) => {
    try {
      const { data } = await apiClient.get<BarberShopServices[]>(
        `/barber/${slug}/dashboard/services`,
      );
      return data;
    } catch (error) {
      console.error("Erro ao buscar serviços do dashboard:", error);
      return [];
    }
  },
};
