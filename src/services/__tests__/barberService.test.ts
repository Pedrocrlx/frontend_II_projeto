import { BarberService, BarberShopData } from '../barberService';
import api from '../api';

const getSpy = jest.spyOn(api, 'get');

describe('BarberService', () => {
  afterEach(() => {
    getSpy.mockClear();
  });

  it('should fetch barber profile by slug', async () => {
    const mockData: Partial<BarberShopData> = { name: 'Test Shop', slug: 'test-shop' };

    getSpy.mockResolvedValue({ data: mockData });

    const result = await BarberService.getProfileBySlug('test-shop');

    expect(result?.name).toBe('Test Shop');
    expect(getSpy).toHaveBeenCalledWith('/barber/test-shop');
  });

  it('should return null if an error occurs', async () => {
    getSpy.mockRejectedValue(new Error('Network Error'));

    const result = await BarberService.getProfileBySlug('test-shop');

    expect(result).toBeNull();
    expect(getSpy).toHaveBeenCalledWith('/barber/test-shop');
  });
});
