import type { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

export interface AuthSession extends Session {
  user: User;
}

export interface SignUpData {
  email: string;
  password: string;
  metadata?: {
    name?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (data: SignUpData) => Promise<{ user: AuthUser | null; error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ user: AuthUser | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}
