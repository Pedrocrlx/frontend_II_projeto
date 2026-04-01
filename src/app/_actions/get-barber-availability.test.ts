import { calculateAvailableSlots, getBarberAvailableDates, AvailabilityQuery } from "./get-barber-availability";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockFindMany = prisma.booking.findMany as jest.Mock;

describe("calculateAvailableSlots", () => {
  const businessHours = { start: 9, end: 19 };
  const serviceDuration = 30;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all slots when there are no bookings", async () => {
    const date = new Date("2024-02-15");
    const existingBookings: Array<{ startTime: Date; endTime: Date }> = [];

    const slots = await calculateAvailableSlots(date, existingBookings, serviceDuration, businessHours);

    // Should have 20 slots (9:00-18:30, 30-minute intervals)
    expect(slots.length).toBe(20);
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("18:30");
  });

  it("should exclude slots that overlap with existing bookings", async () => {
    const date = new Date("2024-02-15");
    const existingBookings = [
      {
        startTime: new Date("2024-02-15T10:00:00"),
        endTime: new Date("2024-02-15T10:30:00"),
      },
    ];

    const slots = await calculateAvailableSlots(date, existingBookings, serviceDuration, businessHours);

    // Should not include 10:00 slot
    expect(slots).not.toContain("10:00");
    // Should include slots before and after
    expect(slots).toContain("09:30");
    expect(slots).toContain("10:30");
  });

  it("should handle multiple bookings", async () => {
    const date = new Date("2024-02-15");
    const existingBookings = [
      {
        startTime: new Date("2024-02-15T09:00:00"),
        endTime: new Date("2024-02-15T09:30:00"),
      },
      {
        startTime: new Date("2024-02-15T14:00:00"),
        endTime: new Date("2024-02-15T15:00:00"),
      },
    ];

    const slots = await calculateAvailableSlots(date, existingBookings, serviceDuration, businessHours);

    // Should not include booked slots
    expect(slots).not.toContain("09:00");
    expect(slots).not.toContain("14:00");
    expect(slots).not.toContain("14:30");
    // Should include available slots
    expect(slots).toContain("09:30");
    expect(slots).toContain("13:30");
    expect(slots).toContain("15:00");
  });

  it("should not include slots that would end after business hours", async () => {
    const date = new Date("2024-02-15");
    const existingBookings: Array<{ startTime: Date; endTime: Date }> = [];

    const slots = await calculateAvailableSlots(date, existingBookings, serviceDuration, businessHours);

    // Last slot should be 18:30 (ends at 19:00)
    expect(slots[slots.length - 1]).toBe("18:30");
    // Should not have 19:00 slot (would end at 19:30)
    expect(slots).not.toContain("19:00");
  });

  it("should return slots in chronological order", async () => {
    const date = new Date("2024-02-15");
    const existingBookings: Array<{ startTime: Date; endTime: Date }> = [];

    const slots = await calculateAvailableSlots(date, existingBookings, serviceDuration, businessHours);

    // Verify slots are in order
    for (let i = 1; i < slots.length; i++) {
      const prevTime = slots[i - 1].split(":").map(Number);
      const currTime = slots[i].split(":").map(Number);
      const prevMinutes = prevTime[0] * 60 + prevTime[1];
      const currMinutes = currTime[0] * 60 + currTime[1];
      expect(currMinutes).toBeGreaterThan(prevMinutes);
    }
  });

  it("should handle bookings that span multiple slots", async () => {
    const date = new Date("2024-02-15");
    const existingBookings = [
      {
        startTime: new Date("2024-02-15T10:00:00"),
        endTime: new Date("2024-02-15T11:30:00"), // 90-minute booking
      },
    ];

    const slots = await calculateAvailableSlots(date, existingBookings, serviceDuration, businessHours);

    // Should not include any slots that overlap with the booking
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("10:30");
    expect(slots).not.toContain("11:00");
    // Should include slots before and after
    expect(slots).toContain("09:30");
    expect(slots).toContain("11:30");
  });
});

describe("getBarberAvailableDates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all dates as available when barber has no bookings", async () => {
    mockFindMany.mockResolvedValue([]);

    const query: AvailabilityQuery = {
      barberId: "barber-1",
      startDate: new Date("2024-02-01T00:00:00Z"),
      endDate: new Date("2024-02-03T23:59:59Z"),
      serviceDuration: 30,
    };

    const result = await getBarberAvailableDates(query);

    expect(result.barberId).toBe("barber-1");
    expect(result.availableDates.length).toBe(3); // All 3 days available
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        barberId: "barber-1",
        startTime: {
          gte: query.startDate,
          lte: query.endDate,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });
  });

  it("should exclude dates with no available slots (fully booked)", async () => {
    // Create bookings that cover all slots for 2024-02-02
    const fullDayBookings: Array<{ startTime: Date; endTime: Date }> = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = new Date(
          `2024-02-02T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`
        );
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);

        fullDayBookings.push({
          startTime,
          endTime,
        });
      }
    }

    mockFindMany.mockResolvedValue(fullDayBookings);

    const query: AvailabilityQuery = {
      barberId: "barber-1",
      startDate: new Date("2024-02-01T00:00:00Z"),
      endDate: new Date("2024-02-03T23:59:59Z"),
      serviceDuration: 30,
    };

    const result = await getBarberAvailableDates(query);

    // Feb 2 should not be in available dates (fully booked)
    // Feb 1 and Feb 3 should be available
    expect(result.availableDates).toHaveLength(2);
    expect(result.dateAvailability.get("2024-02-02")?.isAvailable).toBe(false);
    expect(result.dateAvailability.get("2024-02-02")?.availableSlots).toBe(0);
  });

  it("should return dates with partial availability", async () => {
    // One booking on 2024-02-02 at 10:00-10:30
    const partialBookings = [
      {
        startTime: new Date("2024-02-02T10:00:00"),
        endTime: new Date("2024-02-02T10:30:00"),
      },
    ];

    mockFindMany.mockResolvedValue(partialBookings);

    const query: AvailabilityQuery = {
      barberId: "barber-1",
      startDate: new Date("2024-02-01T00:00:00Z"),
      endDate: new Date("2024-02-03T23:59:59Z"),
      serviceDuration: 30,
    };

    const result = await getBarberAvailableDates(query);

    // All 3 days should be available (Feb 2 still has other slots)
    expect(result.availableDates.length).toBe(3);
    
    // Check dateAvailability map
    const feb2Key = "2024-02-02";
    const feb2Availability = result.dateAvailability.get(feb2Key);
    
    expect(feb2Availability).toBeDefined();
    expect(feb2Availability?.isAvailable).toBe(true);
    expect(feb2Availability?.availableSlots).toBe(19); // 20 total - 1 booked = 19
    expect(feb2Availability?.totalSlots).toBe(20); // 9-19 with 30-min intervals
  });

  it("should handle bookings spanning multiple days correctly", async () => {
    const bookings = [
      // Booking on Feb 1 at 14:00-15:00
      {
        startTime: new Date("2024-02-01T14:00:00"),
        endTime: new Date("2024-02-01T15:00:00"),
      },
      // Booking on Feb 3 at 11:00-12:00
      {
        startTime: new Date("2024-02-03T11:00:00"),
        endTime: new Date("2024-02-03T12:00:00"),
      },
    ];

    mockFindMany.mockResolvedValue(bookings);

    const query: AvailabilityQuery = {
      barberId: "barber-1",
      startDate: new Date("2024-02-01T00:00:00Z"),
      endDate: new Date("2024-02-03T23:59:59Z"),
      serviceDuration: 30,
    };

    const result = await getBarberAvailableDates(query);

    // All days should be available
    expect(result.availableDates.length).toBe(3);
    
    // Feb 2 should have all slots (no bookings)
    const feb2Availability = result.dateAvailability.get("2024-02-02");
    expect(feb2Availability?.availableSlots).toBe(20);
    
    // Feb 1 should have fewer slots (2 slots blocked: 14:00 and 14:30)
    const feb1Availability = result.dateAvailability.get("2024-02-01");
    expect(feb1Availability?.availableSlots).toBe(18); // 20 - 2 = 18
  });

  it("should return availableDates as Date objects", async () => {
    mockFindMany.mockResolvedValue([]);

    const query: AvailabilityQuery = {
      barberId: "barber-1",
      startDate: new Date("2024-02-01T00:00:00Z"),
      endDate: new Date("2024-02-02T23:59:59Z"),
      serviceDuration: 30,
    };

    const result = await getBarberAvailableDates(query);

    // Check that dates are Date objects
    expect(result.availableDates[0]).toBeInstanceOf(Date);
    expect(result.availableDates[1]).toBeInstanceOf(Date);
  });

  it("should populate dateAvailability Map with ISO date keys", async () => {
    mockFindMany.mockResolvedValue([]);

    const query: AvailabilityQuery = {
      barberId: "barber-1",
      startDate: new Date("2024-02-01T00:00:00Z"),
      endDate: new Date("2024-02-02T23:59:59Z"),
      serviceDuration: 30,
    };

    const result = await getBarberAvailableDates(query);

    // Check Map keys are ISO date strings
    expect(result.dateAvailability.has("2024-02-01")).toBe(true);
    expect(result.dateAvailability.has("2024-02-02")).toBe(true);
    
    // Check availability data structure
    const feb1 = result.dateAvailability.get("2024-02-01");
    expect(feb1).toMatchObject({
      date: expect.any(Date),
      isAvailable: true,
      availableSlots: 20,
      totalSlots: 20,
    });
  });
});
