/**
 * @jest-environment node
 */
import { notFound } from "next/navigation";
import { BarberService } from "@/services/barberService";
import BarberPage, { generateMetadata } from "./page";
import React from "react";

jest.mock("@/services/barberService", () => ({
  BarberService: {
    getProfileBySlug: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// BookingSheet uses client hooks — stub it for SSR tests
jest.mock("./_components/BookingSheet", () => ({
  BookingSheet: () => null,
}));

const mockGetProfile = BarberService.getProfileBySlug as jest.Mock;
const mockNotFound = notFound as jest.Mock;

function findTextInTree(node: React.ReactNode, text: string): boolean {
  if (node === null || node === undefined) return false;
  if (typeof node === "string" || typeof node === "number") {
    return node.toString().includes(text);
  }
  if (Array.isArray(node)) return node.some((child) => findTextInTree(child, text));
  if (React.isValidElement(node) && node.props.children) {
    return findTextInTree(node.props.children, text);
  }
  return false;
}

const mockBarber = {
  id: "1",
  name: "Test Barber Shop",
  slug: "test-barber-shop",
  description: "A great shop",
  services: [{ id: "s1", name: "Haircut", duration: 30, price: 20, barberShopId: "1", description: null }],
  barbers: [{ id: "b1", name: "John Doe", description: "Master Barber" }],
  duration: 30,
};

describe("BarberPage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should render shop name, services and barbers", async () => {
    mockGetProfile.mockResolvedValue(mockBarber);

    const tree = await BarberPage({ params: Promise.resolve({ slug: "test-barber-shop" }) });

    expect(findTextInTree(tree, "Test Barber Shop")).toBe(true);
    expect(findTextInTree(tree, "Haircut")).toBe(true);
    expect(findTextInTree(tree, "John Doe")).toBe(true);
  });

  it("should show empty state messages when no services or barbers", async () => {
    mockGetProfile.mockResolvedValue({ ...mockBarber, services: [], barbers: [] });

    const tree = await BarberPage({ params: Promise.resolve({ slug: "test-barber-shop" }) });

    expect(findTextInTree(tree, "No services available")).toBe(true);
    expect(findTextInTree(tree, "No barbers available")).toBe(true);
  });

  it("should call notFound when barber shop does not exist", async () => {
    mockGetProfile.mockResolvedValue(null);

    await BarberPage({ params: Promise.resolve({ slug: "non-existent" }) });

    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it("should call notFound for favicon.ico slug without fetching", async () => {
    await BarberPage({ params: Promise.resolve({ slug: "favicon.ico" }) });

    expect(mockNotFound).toHaveBeenCalledTimes(1);
    expect(mockGetProfile).not.toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return correct title and description when barber is found", async () => {
    mockGetProfile.mockResolvedValue(mockBarber);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "test-barber-shop" }) });

    expect(metadata.title).toBe("Test Barber Shop - Book Your Appointment");
    expect(metadata.description).toBe("A great shop");
  });

  it("should return empty metadata when barber is not found", async () => {
    mockGetProfile.mockResolvedValue(null);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "non-existent" }) });

    expect(metadata).toEqual({});
  });

  it("should use fallback description when shop has no description", async () => {
    mockGetProfile.mockResolvedValue({ ...mockBarber, description: null });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "test-barber-shop" }) });

    expect(metadata.description).toBe("Book your appointment at Test Barber Shop. Professional barbershop services with online booking.");
  });

  it("should return empty metadata for favicon.ico", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "favicon.ico" }) });

    expect(metadata).toEqual({});
  });
});
