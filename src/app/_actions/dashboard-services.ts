"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedBarberShopContext } from "./_helpers/auth-context";

export interface ServiceData {
  name: string;
  description?: string;
  price: number | string; // Accept both number and string for price because Prisma's Decimal can be returned as a string
  duration: number;
}

export async function getShopByUserId() {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) return null;

    const shop = await prisma.barberShop.findUnique({
      where: { id: authContext.barberShopId },
      include: { services: true },
    });

    if (!shop) return null;

    // Transform services to convert Decimal to string
    // This is necessary because Prisma's Decimal type cannot be directly serialized to JSON
    return {
      ...shop,
      services: shop.services.map((service) => ({
        ...service,
        price: service.price.toString(), // Convert Decimal to string
      })),
    };

  } catch (error) {
    console.error("Error fetching shop:", error);
    return null;
  }
}

export async function createService(data: ServiceData) {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) {
      return { error: "Unauthorized." };
    }

    // Check service limit (max 20)
    const count = await prisma.service.count({
      where: { barberShopId: authContext.barberShopId },
    });

    if (count >= 20) {
      return { error: "Maximum limit of 20 services reached." };
    }

    const service = await prisma.service.create({
      data: {
        ...data,
        barberShopId: authContext.barberShopId,
      },
    });

    revalidatePath("/dashboard/services");
    return { service: { ...service, price: service.price.toString() } }; // Convert Decimal to string
  } catch (error) {
    console.error("Error creating service:", error);
    return { error: "Failed to create service." };
  }
}

export async function updateService(id: string, data: Partial<ServiceData>) {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) {
      return { error: "Unauthorized." };
    }

    const updateResult = await prisma.service.updateMany({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
      data,
    });

    if (updateResult.count === 0) {
      return { error: "Service not found." };
    }

    const service = await prisma.service.findFirst({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
    });

    if (!service) {
      return { error: "Service not found." };
    }

    revalidatePath("/dashboard/services");
    return { service: { ...service, price: service.price.toString() } }; // Convert Decimal to string
  } catch (error) {
    console.error("Error updating service:", error);
    return { error: "Failed to update service." };
  }
}

export async function deleteService(id: string) {
  try {
    const authContext = await getAuthenticatedBarberShopContext();
    if (!authContext) {
      return { error: "Unauthorized." };
    }

    const service = await prisma.service.findFirst({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
    });
    
    if (!service) {
      return { error: "Service not found." };
    }

    // Check minimum service requirement (at least 1 service must remain)
    const serviceCount = await prisma.service.count({
      where: { barberShopId: authContext.barberShopId },
    });

    if (serviceCount <= 1) {
      return { error: "Cannot delete the last service. At least 1 service is required." };
    }

    await prisma.service.deleteMany({
      where: {
        id,
        barberShopId: authContext.barberShopId,
      },
    });

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { error: "Failed to delete service." };
  }
}
