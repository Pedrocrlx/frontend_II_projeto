"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from "@supabase/supabase-js";

export interface ServerActionResponse {
  status: 200 | 400 | 401 | 404 | 409 | 500;
  message: string;
  data?: any;
}

export interface ThemeUpdateData {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

/**
 * Authenticate user using session cookie
 */
async function authenticateUser() {
  const headersList = await headers();
  const authToken = headersList.get('authorization');
  
  if (!authToken?.startsWith('Bearer ')) {
    return null;
  }

  const token = authToken.replace('Bearer ', '');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Save theme customization to the database
 */
export async function saveThemeCustomization(
  token: string,
  themeData: ThemeUpdateData
): Promise<ServerActionResponse> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { status: 401, message: "Unauthorized" };
    }

    // Find the user's barbershop
    const userRecord = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { barberShop: true },
    });

    if (!userRecord || !userRecord.barberShop) {
      return { status: 404, message: "Barbershop not found" };
    }

    // Update the barbershop with theme data
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (themeData.primaryColor !== undefined) {
      updateData.primaryColor = themeData.primaryColor;
    }
    if (themeData.secondaryColor !== undefined) {
      updateData.secondaryColor = themeData.secondaryColor;
    }
    if (themeData.logoUrl !== undefined) {
      updateData.logoUrl = themeData.logoUrl;
    }

    const updatedBarberShop = await prisma.barberShop.update({
      where: { id: userRecord.barberShop.id },
      data: updateData,
    });

    console.log('Updated barbershop theme:', {
      id: updatedBarberShop.id,
      primaryColor: updatedBarberShop.primaryColor,
      secondaryColor: updatedBarberShop.secondaryColor,
      logoUrl: updatedBarberShop.logoUrl,
    });

    // Revalidate the barbershop's public page
    revalidatePath(`/${updatedBarberShop.slug}`);
    revalidatePath(`/dashboard/customize`);

    return { 
      status: 200, 
      message: "Theme saved successfully",
      data: {
        primaryColor: updatedBarberShop.primaryColor,
        secondaryColor: updatedBarberShop.secondaryColor,
        logoUrl: updatedBarberShop.logoUrl,
      }
    };
  } catch (error) {
    console.error("Error saving theme:", error);
    return { status: 500, message: "Failed to save theme" };
  }
}

/**
 * Load current theme configuration
 */
export async function loadThemeCustomization(token: string): Promise<ServerActionResponse> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { status: 401, message: "Unauthorized" };
    }

    // Find the user's barbershop
    const userRecord = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { barberShop: true },
    });

    if (!userRecord || !userRecord.barberShop) {
      return { status: 404, message: "Barbershop not found" };
    }

    return { 
      status: 200, 
      message: "Theme loaded successfully",
      data: {
        primaryColor: userRecord.barberShop.primaryColor || '#000000',
        secondaryColor: userRecord.barberShop.secondaryColor || '#666666',
        logoUrl: userRecord.barberShop.logoUrl,
      }
    };
  } catch (error) {
    console.error("Error loading theme:", error);
    return { status: 500, message: "Failed to load theme" };
  }
}

/**
 * Reset theme to defaults
 */
export async function resetThemeCustomization(token: string): Promise<ServerActionResponse> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { status: 401, message: "Unauthorized" };
    }

    // Find the user's barbershop
    const userRecord = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { barberShop: true },
    });

    if (!userRecord || !userRecord.barberShop) {
      return { status: 404, message: "Barbershop not found" };
    }

    // Reset theme to defaults
    const updatedBarberShop = await prisma.barberShop.update({
      where: { id: userRecord.barberShop.id },
      data: {
        primaryColor: null,
        secondaryColor: null,
        // Keep logo unless explicitly requested to remove
        updatedAt: new Date(),
      },
    });

    // Revalidate the barbershop's public page
    revalidatePath(`/${updatedBarberShop.slug}`);
    revalidatePath(`/dashboard/customize`);

    return { 
      status: 200, 
      message: "Theme reset successfully",
      data: {
        primaryColor: '#000000', // Default
        secondaryColor: '#666666', // Default
        logoUrl: updatedBarberShop.logoUrl, // Keep current logo
      }
    };
  } catch (error) {
    console.error("Error resetting theme:", error);
    return { status: 500, message: "Failed to reset theme" };
  }
}