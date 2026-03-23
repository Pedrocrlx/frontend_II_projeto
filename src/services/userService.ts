import { prisma } from "@/lib/prisma";
import api from "./api";
import { supabase } from "@/lib/supabase";

interface UserCreateData {
  email: string;
  supabaseId: string;
}

interface UserResponse {
  id: string;
  email: string;
  supabaseId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ShopStatusResponse {
  hasShop: boolean;
  slug: string | null;
}

class UserService {
  async createUser(data: UserCreateData): Promise<{ user: UserResponse | null; error: Error | null }> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { supabaseId: data.supabaseId },
      });

      if (existingUser) {
        return { user: existingUser, error: null };
      }

      const user = await prisma.user.create({ data });
      console.log(`User created: ${user.email}`);
      return { user, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create user");
      console.error("Error creating user:", error);
      return { user: null, error };
    }
  }

  async getUserBySupabaseId(supabaseId: string): Promise<{ user: UserResponse | null; error: Error | null }> {
    try {
      const user = await prisma.user.findUnique({ where: { supabaseId } });
      return { user, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get user");
      console.error("Error getting user:", error);
      return { user: null, error };
    }
  }

  async getUserByEmail(email: string): Promise<{ user: UserResponse | null; error: Error | null }> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      return { user, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get user");
      console.error("Error getting user:", error);
      return { user: null, error };
    }
  }

  async updateUserEmail(supabaseId: string, newEmail: string): Promise<{ user: UserResponse | null; error: Error | null }> {
    try {
      const user = await prisma.user.update({ where: { supabaseId }, data: { email: newEmail } });
      return { user, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update user");
      console.error("Error updating user:", error);
      return { user: null, error };
    }
  }

  async deleteUser(supabaseId: string): Promise<{ error: Error | null }> {
    try {
      await prisma.user.delete({ where: { supabaseId } });
      console.log(`User deleted: ${supabaseId}`);
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete user");
      console.error("Error deleting user:", error);
      return { error };
    }
  }

  /**
   * Check if the currently authenticated user has a barbershop.
   * Used to decide whether to redirect to /onboarding or /dashboard after login.
   */
  async getShopStatus(): Promise<{ hasShop: boolean; slug: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return { hasShop: false, slug: null };

      const response = await api.get<ShopStatusResponse>("/user/shop-status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      return response.data;
    } catch {
      // Safe default: send to onboarding if check fails
      return { hasShop: false, slug: null };
    }
  }
}

export const userService = new UserService();
