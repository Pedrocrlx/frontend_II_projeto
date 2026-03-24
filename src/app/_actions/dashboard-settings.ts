"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StorageService } from "@/services/storageService";

export interface ShopData {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  logoUrl?: string;
}

export async function updateShop(id: string, data: Partial<ShopData>) {
  try {
    const existingShop = await prisma.barberShop.findUnique({ where: { id } });

    if (existingShop?.logoUrl && data.logoUrl && existingShop.logoUrl !== data.logoUrl) {
      await StorageService.deleteImage(existingShop.logoUrl);
    }

    const shop = await prisma.barberShop.update({
      where: { id },
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
