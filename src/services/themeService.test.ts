import { describe, it, expect } from '@jest/globals';
import { ThemeService } from '@/services/themeService';

describe('ThemeService', () => {
  describe('generateThemeCSS', () => {
    it('should generate CSS variables for both colors', () => {
      const theme = {
        primaryColor: '#FF5733',
        secondaryColor: '#33A1FF',
        logoUrl: null
      };

      const result = ThemeService.generateThemeCSS(theme);
      
      expect(result).toBe(':root { --barbershop-primary: #FF5733; --barbershop-secondary: #33A1FF; }');
    });

    it('should generate CSS for only primary color when secondary is null', () => {
      const theme = {
        primaryColor: '#FF5733',
        secondaryColor: null,
        logoUrl: null
      };

      const result = ThemeService.generateThemeCSS(theme);
      
      expect(result).toBe(':root { --barbershop-primary: #FF5733; }');
    });

    it('should return empty string when no colors are provided', () => {
      const theme = {
        primaryColor: null,
        secondaryColor: null,
        logoUrl: null
      };

      const result = ThemeService.generateThemeCSS(theme);
      
      expect(result).toBe('');
    });
  });

  describe('getDefaultTheme', () => {
    it('should return default theme values', () => {
      const defaultTheme = ThemeService.getDefaultTheme();
      
      expect(defaultTheme).toEqual({
        primaryColor: '#000000',
        secondaryColor: '#666666',
        logoUrl: null
      });
    });
  });
});