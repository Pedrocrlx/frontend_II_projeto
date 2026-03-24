import api from "./api";
import { supabase } from "@/lib/supabase";

/**
 * Strips all non-digit characters except the leading '+' from a phone string.
 * Preserves the country dial code prefix if already present (e.g. "+351912345678").
 * Examples: "+351 912 345 678" → "+351912345678", "912 345-678" → "912345678"
 */
export function sanitizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    return "+" + trimmed.slice(1).replace(/\D/g, "");
  }
  return trimmed.replace(/\D/g, "");
}

export interface OnboardingBarber {
  name: string;
  specialty?: string;
  phone: string;
  instagram?: string;
}

export interface OnboardingServiceItem {
  name: string;
  price: string;
  duration: string;
}

export interface OnboardingPayload {
  shop: {
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  };
  barbers: OnboardingBarber[];
  services: OnboardingServiceItem[];
}

export interface OnboardingResult {
  barberShopId: string;
  slug: string;
}

class OnboardingServiceClient {
  /**
   * Complete onboarding: creates the barbershop, barbers, and services atomically.
   * Attaches the Supabase JWT so the API route can identify the owner.
   */
  async complete(
    payload: OnboardingPayload
  ): Promise<{ data: OnboardingResult | null; error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { data: null, error: "Not authenticated" };
      }

      const response = await api.post<OnboardingResult>(
        "/onboarding/complete",
        payload,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      console.log(`Onboarding complete: shop slug = ${response.data.slug}`);
      return { data: response.data, error: null };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const message =
        axiosErr?.response?.data?.error ??
        axiosErr?.message ??
        "Failed to complete onboarding";
      console.error("Onboarding error:", axiosErr?.response?.status, message);
      return { data: null, error: message };
    }
  }

  /**
   * Check if a slug is available before the user submits.
   */
  async checkSlug(slug: string): Promise<{ available: boolean; error: string | null }> {
    try {
      const response = await api.get<{ available: boolean }>(`/onboarding/check-slug?slug=${slug}`);
      return { available: response.data.available, error: null };
    } catch {
      return { available: false, error: "Failed to check slug availability" };
    }
  }
}

export const onboardingService = new OnboardingServiceClient();
