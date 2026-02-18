/**
 * @jest-environment node
 */
import { notFound } from "next/navigation";
import { BarberService } from "@/services/barberService";
import BarberPage from "./page";
import React from 'react';

// Mock the services and modules
jest.mock("@/services/barberService", () => ({
  BarberService: {
    getProfileBySlug: jest.fn(),
  },
}));
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

const mockBarberService = BarberService as jest.Mocked<typeof BarberService>;
const mockNotFound = notFound as jest.Mock;

/**
 * Helper function to recursively search for a text string within a React tree.
 * This allows testing component output without a full DOM render.
 */
function findTextInReactTree(node: React.ReactNode, text: string | RegExp): boolean {
  if (node === null || node === undefined) {
    return false;
  }

  // Check if the node itself is the text we're looking for
  if (typeof node === 'string' || typeof node === 'number') {
    const nodeText = node.toString();
    return typeof text === 'string' ? nodeText.includes(text) : text.test(nodeText);
  }

  // If it's an array, search in each child
  if (Array.isArray(node)) {
    return node.some(child => findTextInReactTree(child, text));
  }

  // If it's a React element, search its children
  if (React.isValidElement(node) && node.props.children) {
    return findTextInReactTree(node.props.children, text);
  }

  return false;
}


describe("BarberPage (Node Environment Test)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should generate a page structure containing the barber shop name", async () => {
    const mockBarberProfile = {
      id: "1",
      name: "Test Barber Shop",
      slug: "test-barber-shop",
      services: [{ id: "s1", name: "Haircut", duration: 30, price: 20 }],
      barbers: [{ id: "b1", name: "John Doe", description: "Master Barber" }],
    };
    mockBarberService.getProfileBySlug.mockResolvedValue(mockBarberProfile);

    // Await the Server Component to get the JSX structure
    const pageTree = await BarberPage({ params: { slug: "test-barber-shop" } });

    // Assert that the text exists somewhere in the component tree
    expect(findTextInReactTree(pageTree, "Test Barber Shop")).toBe(true);
    expect(findTextInReactTree(pageTree, "Haircut")).toBe(true);
    expect(findTextInReactTree(pageTree, "John Doe")).toBe(true);
  });

  it("should generate a page structure with 'no services' message", async () => {
    const mockBarberProfile = {
      id: "2",
      name: "Empty Barber Shop",
      slug: "empty-barber-shop",
      services: [],
      barbers: [],
    };
    mockBarberService.getProfileBySlug.mockResolvedValue(mockBarberProfile);

    const pageTree = await BarberPage({ params: { slug: "empty-barber-shop" } });

    expect(findTextInReactTree(pageTree, "Empty Barber Shop")).toBe(true);
    expect(findTextInReactTree(pageTree, "Nenhum serviço disponível de momento.")).toBe(true);
    expect(findTextInReactTree(pageTree, "Nenhum barbeiro disponível de momento.")).toBe(true);
  });

  it("should call notFound when the barber shop slug does not exist", async () => {
    mockBarberService.getProfileBySlug.mockResolvedValue(null);

    await BarberPage({ params: { slug: "non-existent-slug" } });

    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it("should call notFound for 'favicon.ico' slug", async () => {
    await BarberPage({ params: { slug: "favicon.ico" } });
    
    expect(mockNotFound).toHaveBeenCalledTimes(1);
    expect(mockBarberService.getProfileBySlug).not.toHaveBeenCalled();
  });
});