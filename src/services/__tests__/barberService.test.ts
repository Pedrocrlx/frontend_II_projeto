import { BarberService } from '../barberService';
import api from '../api';

jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('BarberService', () => {
  it('should fetch barber profile by slug', async () => {
    const mockData = { name: 'Test Shop', slug: 'test-shop' };
    mockedApi.get.mockResolvedValue({ data: mockData });

    const result = await BarberService.getProfileBySlug('test-shop');
    
    expect(result.name).toBe('Test Shop');
    expect(mockedApi.get).toHaveBeenCalledWith('/barber/test-shop');
  });
});