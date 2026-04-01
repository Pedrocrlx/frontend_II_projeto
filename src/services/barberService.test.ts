import { BarberService } from "./barberService";
import type { AxiosInstance } from "axios";

const mockGet = jest.fn();
const fakeApi = { get: mockGet } as unknown as AxiosInstance;

describe("BarberService.getProfileBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should fetch barber profile by slug", async () => {
    const mockData = {
      id: "1",
      name: "Test Shop",
      slug: "test-shop",
      services: [],
      barbers: [],
      duration: 30,
    };
    mockGet.mockResolvedValue({ data: mockData });

    const result = await BarberService.getProfileBySlug("test-shop", fakeApi);

    expect(result?.name).toBe("Test Shop");
    expect(result?.slug).toBe("test-shop");
    expect(mockGet).toHaveBeenCalledWith("/barber/test-shop");
  });

  it("should return null if an error occurs", async () => {
    mockGet.mockRejectedValue(new Error("Network Error"));

    const result = await BarberService.getProfileBySlug("test-shop", fakeApi);

    expect(result).toBeNull();
    expect(mockGet).toHaveBeenCalledWith("/barber/test-shop");
  });

  it("should return null for favicon.ico slug", async () => {
    const result = await BarberService.getProfileBySlug("favicon.ico", fakeApi);

    expect(result).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should return null for empty slug", async () => {
    const result = await BarberService.getProfileBySlug("", fakeApi);

    expect(result).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should return full barber shop data including services and barbers", async () => {
    const mockData = {
      id: "2",
      name: "Full Shop",
      slug: "full-shop",
      description: "A great shop",
      services: [{ id: "s1", name: "Haircut", price: 15, duration: 30, barberShopId: "2" }],
      barbers: [{ id: "b1", name: "John", imageUrl: null, description: "Expert" }],
      duration: 30,
    };
    mockGet.mockResolvedValue({ data: mockData });

    const result = await BarberService.getProfileBySlug("full-shop", fakeApi);

    expect(result?.services).toHaveLength(1);
    expect(result?.barbers).toHaveLength(1);
    expect(result?.description).toBe("A great shop");
  });
});
