"use server";

// Date availability information
export interface DateAvailability {
  date: Date;
  isAvailable: boolean;
  availableSlots: number;
  totalSlots: number;
}

// Barber availability query parameters
export interface AvailabilityQuery {
  barberId: string;
  startDate: Date;
  endDate: Date;
  serviceDuration: number;
}

// Barber availability response
export interface AvailabilityResponse {
  barberId: string;
  availableDates: Date[];
  dateAvailability: Map<string, DateAvailability>; // ISO date string -> availability
}

import { prisma } from "@/lib/prisma";

interface Booking {
  startTime: Date;
  endTime: Date;
}

/**
 * Calculate available time slots for a specific date
 * @param date - The date to check availability for
 * @param existingBookings - Array of bookings for this date and barber
 * @param serviceDuration - Duration of the service in minutes
 * @param businessHours - Business hours with start and end times (24-hour format)
 * @returns Array of available time slot strings (e.g., ["09:00", "09:30"])
 */
export async function calculateAvailableSlots(
  date: Date,
  existingBookings: Booking[],
  serviceDuration: number,
  businessHours: { start: number; end: number }
): Promise<string[]> {
  const availableSlots: string[] = [];
  
  // Generate all possible 30-minute time slots
  let currentHour = businessHours.start;
  let currentMinute = 0;
  
  while (currentHour < businessHours.end || (currentHour === businessHours.end && currentMinute === 0)) {
    // Create slot start time
    const slotStart = new Date(date);
    slotStart.setHours(currentHour, currentMinute, 0, 0);
    
    // Create slot end time (start + service duration)
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);
    
    // Check if slot end exceeds business hours
    const slotEndHour = slotEnd.getHours();
    const slotEndMinute = slotEnd.getMinutes();
    
    if (slotEndHour > businessHours.end || (slotEndHour === businessHours.end && slotEndMinute > 0)) {
      break; // No more slots fit in business hours
    }
    
    // Check for conflicts with existing bookings
    let hasConflict = false;
    for (const booking of existingBookings) {
      // Check for time overlap: slot overlaps if it starts before booking ends AND ends after booking starts
      if (slotStart < booking.endTime && slotEnd > booking.startTime) {
        hasConflict = true;
        break;
      }
    }
    
    // Add slot if no conflict
    if (!hasConflict) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      availableSlots.push(timeString);
    }
    
    // Move to next 30-minute slot
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }
  
  return availableSlots;
}

/**
 * Get available dates for a barber within a date range
 * @param query - Query parameters including barberId, date range, and service duration
 * @returns Response with available dates and detailed availability information
 */
export async function getBarberAvailableDates(
  query: AvailabilityQuery
): Promise<AvailabilityResponse> {
  const { barberId, startDate, endDate, serviceDuration } = query;
  
  // Fetch all bookings for the barber in the date range
  const bookings = await prisma.booking.findMany({
    where: {
      barberId: barberId,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });
  
  // Initialize result structures
  const availableDates: Date[] = [];
  const dateAvailability = new Map<string, DateAvailability>();
  
  // Business hours: 9 AM to 7 PM
  const businessHours = { start: 9, end: 19 };
  
  // Calculate total possible slots in a day (30-minute intervals from 9-19)
  const totalSlots = (businessHours.end - businessHours.start) * 2;
  
  // Iterate through each date in the range
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  const endDateNormalized = new Date(endDate);
  endDateNormalized.setHours(23, 59, 59, 999);
  
  while (currentDate <= endDateNormalized) {
    // Filter bookings for this specific date
    const dayBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      return (
        bookingDate.getFullYear() === currentDate.getFullYear() &&
        bookingDate.getMonth() === currentDate.getMonth() &&
        bookingDate.getDate() === currentDate.getDate()
      );
    });
    
    // Calculate available slots for this date
    const availableSlots = await calculateAvailableSlots(
      currentDate,
      dayBookings,
      serviceDuration,
      businessHours
    );
    
    // Create availability record
    const availability: DateAvailability = {
      date: new Date(currentDate),
      isAvailable: availableSlots.length > 0,
      availableSlots: availableSlots.length,
      totalSlots: totalSlots,
    };
    
    // Store in map with ISO date string as key
    const dateKey = currentDate.toISOString().split('T')[0];
    dateAvailability.set(dateKey, availability);
    
    // Add to available dates array if has slots
    if (availability.isAvailable) {
      availableDates.push(new Date(currentDate));
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    barberId,
    availableDates,
    dateAvailability,
  };
}
