// import { describe, it, expect, mock } from "bun:test";
// import { BarberService } from "../barberService";

// describe("BarberService", () => {
//   it("should fetch barber profile by slug", async () => {
//     const mockData = { 
//       name: "Test Shop", 
//       slug: "test-shop", 
//       services: [], 
//       barbers: [] 
//     };

//     const fakeApi = {
//       get: mock().mockResolvedValue({ data: mockData })
//     } as any;

//     const result = await BarberService.getProfileBySlug("test-shop", fakeApi);

//     expect(result?.name).toBe("Test Shop");
//     expect(fakeApi.get).toHaveBeenCalledWith("/barber/test-shop");
//   });

//   it("should return null if an error occurs", async () => {
//     const fakeApi = {
//       get: mock().mockRejectedValue(new Error("Network Error"))
//     } as any;

//     const result = await BarberService.getProfileBySlug("test-shop", fakeApi);

//     expect(result).toBeNull();
//     expect(fakeApi.get).toHaveBeenCalledWith("/barber/test-shop");
//   });
// });