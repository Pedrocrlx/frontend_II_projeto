"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateBookingParams {
  serviceId: string;
  barberId: string;
  barberShopId: string;
  startTime: Date;
  duration: number;
  customerName: string;
  customerPhone: string;
}

export async function createBooking(params: CreateBookingParams) {
  try {
    const endTime = new Date(params.startTime.getTime() + params.duration * 60000);

    await prisma.booking.create({
      data: {
        startTime: params.startTime,
        endTime: endTime,
        barberId: params.barberId,
        serviceId: params.serviceId,
        barberShopId: params.barberShopId,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
      },
    });

    revalidatePath("/[slug]");
    return { success: true };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { success: false };
  }
}