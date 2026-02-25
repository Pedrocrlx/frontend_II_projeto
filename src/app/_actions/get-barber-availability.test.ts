import { calculateAvailableSlots } from "./get-barber-availability";

describe("calculateAvailableSlots", () => {
  const businessHours = { start: 9, end: 19 };
  const serviceDuration = 30;

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
