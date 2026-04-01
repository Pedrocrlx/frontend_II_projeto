"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";

export interface AuthContextResult {
  supabaseUserId: string;
  userId: string;
  barberShopId: string;
}

export async function getAuthenticatedBarberShopContext(): Promise<AuthContextResult | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: { barberShop: true },
  });

  if (!user?.barberShop) {
    return null;
  }

  return {
    supabaseUserId: supabaseUser.id,
    userId: user.id,
    barberShopId: user.barberShop.id,
  };
}
