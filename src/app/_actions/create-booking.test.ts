/**
 * @jest-environment node
 */
import { checkTimeSlotAvailability, clientHasBookingAtTime, createBooking } from "./create-booking";
import { revalidatePath } from "next/cache";

// Mock Prisma and next/cache
jest.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { prisma } from "@/lib/prisma";

const mockFindMany = prisma.booking.findMany as jest.Mock;
const mockCreate = prisma.booking.create as jest.Mock;
const mockRevalidatePath = revalidatePath as jest.Mock;

const baseParams = {
  serviceId: "service-1",
  barberId: "barber-1",
  barberShopId: "shop-1",
  startTime: new Date("2024-03-15T10:00:00"),
  duration: 30,
  customerName: "John Doe",
  customerPhone: "+351912345678",
  customerCountry: "PT",
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("checkTimeSlotAvailability", () => {
  it("should return 200 when no overlapping bookings exist", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await checkTimeSlotAvailability(baseParams);

    expect(result.status).toBe(200);
    expect(result.message).toBe("Time slot is available");
  });

  it("should return 409 when an overlapping booking exists", async () => {
    mockFindMany.mockResolvedValue([{ id: "existing-booking" }]);

    const result = await checkTimeSlotAvailability(baseParams);

    expect(result.status).toBe(409);
    expect(result.message).toBe("Time slot is already booked");
  });

  it("should return 500 on database error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await checkTimeSlotAvailability(baseParams);

    expect(result.status).toBe(500);
    expect(result.message).toBe("Unable to check availability");
  });

  it("should query with correct time range (startTime to endTime)", async () => {
    mockFindMany.mockResolvedValue([]);

    await checkTimeSlotAvailability(baseParams);

    const expectedEndTime = new Date(baseParams.startTime.getTime() + 30 * 60000);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          barberId: "barber-1",
          startTime: { lt: expectedEndTime },
          endTime: { gt: baseParams.startTime },
        }),
      })
    );
  });
});

describe("clientHasBookingAtTime", () => {
  it("should return 200 when client has no booking at that time", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await clientHasBookingAtTime(baseParams);

    expect(result.status).toBe(200);
    expect(result.message).toBe("No existing booking found");
  });

  it("should return 409 when client already has a booking at that time", async () => {
    mockFindMany.mockResolvedValue([{ id: "existing" }]);

    const result = await clientHasBookingAtTime(baseParams);

    expect(result.status).toBe(409);
    expect(result.message).toBe("Client has existing booking at this time");
  });

  it("should return 500 on database error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await clientHasBookingAtTime(baseParams);

    expect(result.status).toBe(500);
    expect(result.message).toBe("Unable to verify existing bookings");
  });

  it("should query by customerPhone, not barberId", async () => {
    mockFindMany.mockResolvedValue([]);

    await clientHasBookingAtTime(baseParams);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          customerPhone: "+351912345678",
        }),
      })
    );
  });
});

describe("createBooking", () => {
  it("should return 200 on successful booking creation and revalidate path", async () => {
    mockCreate.mockResolvedValue({ id: "new-booking" });

    const result = await createBooking(baseParams);

    expect(result.status).toBe(200);
    expect(result.message).toBe("Booking created successfully");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/[slug]");
  });

  it("should return 500 on database error", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));

    const result = await createBooking(baseParams);

    expect(result.status).toBe(500);
    expect(result.message).toBe("Failed to create booking");
  });

  it("should calculate endTime as startTime + duration minutes", async () => {
    mockCreate.mockResolvedValue({ id: "new-booking" });

    await createBooking(baseParams);

    const expectedEndTime = new Date(baseParams.startTime.getTime() + 30 * 60000);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          startTime: baseParams.startTime,
          endTime: expectedEndTime,
          barberId: "barber-1",
          serviceId: "service-1",
          customerCountry: "PT",
        }),
      })
    );
  });
});
