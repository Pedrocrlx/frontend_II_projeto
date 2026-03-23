"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ServiceData {
  name: string;
  description?: string;
  price: number;
  duration: number;
}

export async function getShopByUserId(supabaseId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: {
        barberShop: {
          include: {
            services: true,
          },
        },
      },
    });

    return user?.barberShop || null;
  } catch (error) {
    console.error("Error fetching shop:", error);
    return null;
  }
}

export async function createService(barberShopId: string, data: ServiceData) {
  try {
    // Check service limit (max 20)
    const count = await prisma.service.count({
      where: { barberShopId },
    });

    if (count >= 20) {
      return { error: "Maximum limit of 20 services reached." };
    }

    const service = await prisma.service.create({
      data: {
        ...data,
        barberShopId,
      },
    });

    revalidatePath("/dashboard/services");
    return { service };
  } catch (error) {
    console.error("Error creating service:", error);
    return { error: "Failed to create service." };
  }
}

export async function updateService(id: string, data: Partial<ServiceData>) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/services");
    return { service };
  } catch (error) {
    console.error("Error updating service:", error);
    return { error: "Failed to update service." };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({
      where: { id },
    });

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { error: "Failed to delete service." };
  }
}
