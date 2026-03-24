"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@prisma/client";

export interface BookingFilters {
  startDate?: Date;
  endDate?: Date;
  barberId?: string;
  status?: BookingStatus;
}

export interface BookingWithDetails {
  id: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  customerName: string;
  customerPhone: string;
  customerCountry: string | null;
  barber: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  createdAt: Date;
}

export async function getShopWithBookings(supabaseId: string, filters?: BookingFilters) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: {
        barberShop: {
          include: {
            barbers: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user?.barberShop) return null;

    // Build where clause for bookings
    const whereClause: {
      barberShopId: string;
      startTime?: { gte?: Date; lte?: Date };
      barberId?: string;
      status?: BookingStatus;
    } = {
      barberShopId: user.barberShop.id,
    };

    if (filters?.startDate || filters?.endDate) {
      whereClause.startTime = {};
      if (filters.startDate) {
        whereClause.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.startTime.lte = filters.endDate;
      }
    }

    if (filters?.barberId) {
      whereClause.barberId = filters.barberId;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        barber: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Convert Decimal to number for price
    const formattedBookings: BookingWithDetails[] = bookings.map((booking) => ({
      ...booking,
      service: {
        ...booking.service,
        price: Number(booking.service.price),
      },
    }));

    return {
      shop: user.barberShop,
      barbers: user.barberShop.barbers,
      bookings: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching shop with bookings:", error);
    return null;
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    revalidatePath("/dashboard/bookings");
    return { booking };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { error: "Failed to update booking status." };
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELED" },
    });

    revalidatePath("/dashboard/bookings");
    return { booking };
  } catch (error) {
    console.error("Error canceling booking:", error);
    return { error: "Failed to cancel booking." };
  }
}

export async function confirmBooking(bookingId: string) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    revalidatePath("/dashboard/bookings");
    return { booking };
  } catch (error) {
    console.error("Error confirming booking:", error);
    return { error: "Failed to confirm booking." };
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return { error: "Failed to delete booking." };
  }
}
