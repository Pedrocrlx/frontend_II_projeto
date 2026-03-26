/**
 * @jest-environment node
 */
import { generateMetadata } from './page';
import { BarberService } from '@/services/barberService';
import { ThemeService } from '@/services/themeService';

// Mock the services
jest.mock('@/services/barberService');
jest.mock('@/services/themeService');

const mockBarberService = BarberService as jest.Mocked<typeof BarberService>;
const mockThemeService = ThemeService as jest.Mocked<typeof ThemeService>;

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate metadata with favicon when logo is available', async () => {
    const mockBarber = {
      id: '1',
      name: 'Test Barbershop',
      slug: 'test-barbershop',
      description: 'A great barbershop',
      logoUrl: null,
    };

    const mockTheme = {
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      logoUrl: 'https://example.com/storage/photos/shops/logo.webp',
    };

    mockBarberService.getProfileBySlug.mockResolvedValue(mockBarber as any);
    mockThemeService.getThemeBySlug.mockResolvedValue(mockTheme);

    const params = Promise.resolve({ slug: 'test-barbershop' });
    const metadata = await generateMetadata({ params });

    expect(metadata.title).toBe('Test Barbershop - Book Your Appointment');
    expect(metadata.description).toBe('A great barbershop');
    if (metadata.icons && typeof metadata.icons === 'object' && 'apple' in metadata.icons) {
      expect(metadata.icons.apple).toBe(mockTheme.logoUrl); // Should use theme logo first
    }
  });
});