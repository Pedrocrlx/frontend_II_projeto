"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StorageService } from "@/services/storageService";
import { getAuthenticatedBarberShopContext } from "./_helpers/auth-context";

export interface BarberData {
  name: string;
  description?: string;
  phone: string;
  instagram?: string;
  imageUrl?: string;
}

export async function getShopByUserId() {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) return null;

    const shop = await prisma.barberShop.findUnique({
      where: { id: authContext.barberShopId },
      include: { barbers: true },
    });

    if (!shop) return null;

    return {
      ...shop,
      barbers: shop.barbers,
    };
  } catch (error) {
    console.error("Error fetching shop:", error);
    return null;
  }
}

export async function createBarber(data: BarberData) {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) {
      return { error: "Unauthorized." };
    }

    // Check barber limit (max 10)
    const count = await prisma.barber.count({
      where: { barberShopId: authContext.barberShopId },
    });

    if (count >= 10) {
      return { error: "Maximum limit of 10 barbers reached." };
    }

    const barber = await prisma.barber.create({
      data: {
        ...data,
        barberShopId: authContext.barberShopId,
      },
    });

    revalidatePath("/dashboard/barbers");
    return { barber };
  } catch (error) {
    console.error("Error creating barber:", error);
    return { error: "Failed to create barber." };
  }
}

export async function updateBarber(id: string, data: Partial<BarberData>) {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) {
      return { error: "Unauthorized." };
    }

    const existingBarber = await prisma.barber.findFirst({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
    });

    if (!existingBarber) {
      return { error: "Barber not found." };
    }

    if (existingBarber?.imageUrl && data.imageUrl && existingBarber.imageUrl !== data.imageUrl) {
      await StorageService.deleteImage(existingBarber.imageUrl);
    }

    const barber = await prisma.barber.updateMany({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
      data,
    });

    if (barber.count === 0) {
      return { error: "Barber not found." };
    }

    const updatedBarber = await prisma.barber.findFirst({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
    });

    if (!updatedBarber) {
      return { error: "Barber not found." };
    }

    revalidatePath("/dashboard/barbers");
    return { barber: updatedBarber };
  } catch (error) {
    console.error("Error updating barber:", error);
    return { error: "Failed to update barber." };
  }
}

export async function deleteBarber(id: string) {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) {
      return { error: "Unauthorized." };
    }

    const barber = await prisma.barber.findFirst({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
    });
    
    if (!barber) {
      return { error: "Barber not found." };
    }

    // Check minimum barber requirement (at least 1 barber must remain)
    const barberCount = await prisma.barber.count({
      where: { barberShopId: authContext.barberShopId },
    });

    if (barberCount <= 1) {
      return { error: "Cannot delete the last barber. At least 1 barber is required." };
    }

    if (barber.imageUrl) {
      await StorageService.deleteImage(barber.imageUrl);
    }

    await prisma.barber.deleteMany({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
    });

    revalidatePath("/dashboard/barbers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting barber:", error);
    return { error: "Failed to delete barber." };
  }
}
