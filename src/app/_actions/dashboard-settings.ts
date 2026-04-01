"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StorageService } from "@/services/storageService";
import { getAuthenticatedBarberShopContext } from "./_helpers/auth-context";

export interface ShopData {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  logoUrl?: string;
}

export async function updateShop(data: Partial<ShopData>) {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) {
      return { error: "Unauthorized." };
    }

    const existingShop = await prisma.barberShop.findUnique({
      where: { id: authContext.barberShopId },
    });

    if (!existingShop) {
      return { error: "Shop not found." };
    }

    if (existingShop?.logoUrl && data.logoUrl && existingShop.logoUrl !== data.logoUrl) {
      await StorageService.deleteImage(existingShop.logoUrl);
    }

    const shop = await prisma.barberShop.update({
      where: { id: authContext.barberShopId },
      data,
    });

    revalidatePath("/dashboard/settings");
    revalidatePath(`/${shop.slug}`); // Revalidate public page
    return { shop };
  } catch (error) {
    console.error("Error updating shop:", error);
    return { error: "Failed to update shop." };
  }
}
