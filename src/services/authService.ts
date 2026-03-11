import { supabase } from "@/lib/supabase";
import type { SignUpData, SignInData } from "@/types/auth";

interface AuthResponse<T> {
  data: T | null;
  error: Error | null;
}

class AuthService {
  /**
   * Sign up a new user with email and password
   * @param data - User email, password, and metadata (name)
   * @returns User object or error
   */
  async signUp(data: SignUpData): Promise<AuthResponse<{ id: string; email: string }>> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: data.metadata,
        },
      });

      if (error) {
        return { data: null, error };
      }

      if (!authData.user) {
        return {
          data: null,
          error: new Error("User creation failed"),
        };
      }

      return {
        data: {
          id: authData.user.id,
          email: authData.user.email || "",
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }

  /**
   * Sign in user with email and password
   * @param data - User email and password
   * @returns User object or error
   */
  async signIn(data: SignInData): Promise<AuthResponse<{ id: string; email: string }>> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { data: null, error };
      }

      if (!authData.user) {
        return {
          data: null,
          error: new Error("Sign in failed"),
        };
      }

      return {
        data: {
          id: authData.user.id,
          email: authData.user.email || "",
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }

  /**
   * Sign out the current user
   * @returns Error if sign out fails
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }

  /**
   * Request password reset email
   * @param email - User email address
   * @returns Error if request fails
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }

  /**
   * Update password for user
   * @param newPassword - New password
   * @returns Error if update fails
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }

  /**
   * Get current session
   * @returns Session object or null
   */
  async getSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (err) {
      console.error("Failed to get session:", err);
      return null;
    }
  }

  /**
   * Sign in with Google OAuth
   * @returns Error if sign in fails
   */
  async signInWithGoogle(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }

  /**
   * Get current user
   * @returns User object or null
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (err) {
      console.error("Failed to get current user:", err);
      return null;
    }
  }
}

export const authService = new AuthService();
