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
  customerCountry: string;
}

interface ServerActionResponse {
  status: 200 | 400 | 409 | 500;
  message: string;
  data?: any;
}

export async function checkTimeSlotAvailability(params: CreateBookingParams): Promise<ServerActionResponse> {
  try {
    const endTime = new Date(params.startTime.getTime() + params.duration * 60000);

    const overlappingBookings = await prisma.booking.findMany({
      where: {
        barberId: params.barberId,
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: params.startTime,
        },
      },
    });

    if (overlappingBookings.length > 0) {
      return {
        status: 409,
        message: "Time slot is already booked"
      };
    }

    return {
      status: 200,
      message: "Time slot is available"
    };
  } catch (error) {
    console.error("Failed to check availability:", error);
    return {
      status: 500,
      message: "Unable to check availability"
    };
  }
}

export async function clientHasBookingAtTime(params: CreateBookingParams): Promise<ServerActionResponse> {
  try {
    const endTime = new Date(params.startTime.getTime() + params.duration * 60000);

    const overlappingBookings = await prisma.booking.findMany({
      where: {
        customerPhone: params.customerPhone,
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: params.startTime,
        },
      },
    });

    if (overlappingBookings.length > 0) {
      return {
        status: 409,
        message: "Client has existing booking at this time"
      };
    }

    return {
      status: 200,
      message: "No existing booking found"
    };
  } catch (error) {
    console.error("Failed to check client's booking:", error);
    return {
      status: 500,
      message: "Unable to verify existing bookings"
    };
  }
}

export async function createBooking(params: CreateBookingParams): Promise<ServerActionResponse> {
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
        customerCountry: params.customerCountry,
      },
    });

    revalidatePath("/[slug]");
    return {
      status: 200,
      message: "Booking created successfully"
    };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return {
      status: 500,
      message: "Failed to create booking"
    };
  }
}