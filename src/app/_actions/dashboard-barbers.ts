"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface BarberData {
  name: string;
  description?: string;
  phone: string;
  instagram?: string;
  imageUrl?: string;
}

export async function getShopByUserId(supabaseId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: {
        barberShop: {
          include: {
            barbers: true,
          },
        },
      },
    });

    if (!user?.barberShop) return null;

    return {
      ...user.barberShop,
      barbers: user.barberShop.barbers,
    };
  } catch (error) {
    console.error("Error fetching shop:", error);
    return null;
  }
}

export async function createBarber(barberShopId: string, data: BarberData) {
  try {
    // Check barber limit (max 10)
    const count = await prisma.barber.count({
      where: { barberShopId },
    });

    if (count >= 10) {
      return { error: "Maximum limit of 10 barbers reached." };
    }

    const barber = await prisma.barber.create({
      data: {
        ...data,
        barberShopId,
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
    const barber = await prisma.barber.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/barbers");
    return { barber };
  } catch (error) {
    console.error("Error updating barber:", error);
    return { error: "Failed to update barber." };
  }
}

export async function deleteBarber(id: string) {
  try {
    await prisma.barber.delete({
      where: { id },
    });

    revalidatePath("/dashboard/barbers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting barber:", error);
    return { error: "Failed to delete barber." };
  }
}
