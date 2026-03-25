import { prisma } from '@/lib/prisma';

export interface BarberShopTheme {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  logoUrl?: string | null;
}

/**
 * Service for retrieving theme customization for public pages
 */
export const ThemeService = {
  /**
   * Get theme configuration for a barbershop by slug
   */
  getThemeBySlug: async (slug: string): Promise<BarberShopTheme | null> => {
    try {
      const barberShop = await prisma.barberShop.findUnique({
        where: { slug },
        select: {
          primaryColor: true,
          secondaryColor: true,
          logoUrl: true,
        },
      });

      if (!barberShop) {
        return null;
      }

      return {
        primaryColor: barberShop.primaryColor,
        secondaryColor: barberShop.secondaryColor,
        logoUrl: barberShop.logoUrl,
      };
    } catch (error) {
      console.error('Error fetching theme for slug:', slug, error);
      return null;
    }
  },

  /**
   * Generate CSS variables for theme
   */
  generateThemeCSS: (theme: BarberShopTheme): string => {
    const variables = [
      theme.primaryColor && `--barbershop-primary: ${theme.primaryColor};`,
      theme.secondaryColor && `--barbershop-secondary: ${theme.secondaryColor};`,
    ].filter(Boolean);

    if (variables.length === 0) {
      return '';
    }

    return `:root { ${variables.join(' ')} }`;
  },

  /**
   * Get default theme values
   */
  getDefaultTheme: (): BarberShopTheme => ({
    primaryColor: '#000000',
    secondaryColor: '#666666',
    logoUrl: null,
  }),
};

export default ThemeService;