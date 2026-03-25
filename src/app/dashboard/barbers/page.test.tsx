/**
 * Logic tests for Barbers Page phone selector functionality
 * 
 * These tests verify:
 * 1. Phone validation logic for barber creation/updates
 * 2. Country detection from existing phone numbers
 * 3. Phone number formatting and validation rules
 * 4. Form submission data structure for international phones
 */

import { validateInternationalPhone, COUNTRY_CONFIGS } from "@/lib/utils/phone-validation";

describe("Barbers Page Phone Selector Logic", () => {

  describe("Phone validation for barber forms", () => {
    it("should validate phone numbers correctly for all supported countries", () => {
      const testCases = [
        { phone: "912345678", country: "PT", expected: "+351912345678", shouldPass: true },
        { phone: "11987654321", country: "BR", expected: "+5511987654321", shouldPass: true },
        { phone: "7911123456", country: "GB", expected: "+447911123456", shouldPass: true },
        { phone: "15112345678", country: "DE", expected: "+4915112345678", shouldPass: true },
        { phone: "612345678", country: "FR", expected: "+33612345678", shouldPass: true },
        // Invalid cases
        { phone: "123", country: "PT", expected: "", shouldPass: false },
        { phone: "12345678901234567890", country: "BR", expected: "", shouldPass: false },
        { phone: "", country: "GB", expected: "", shouldPass: false },
      ];

      testCases.forEach(testCase => {
        const result = validateInternationalPhone(testCase.phone, testCase.country);
        
        if (testCase.shouldPass) {
          expect(result.isValid).toBe(true);
          expect(result.fullNumber).toBe(testCase.expected);
          expect(result.error).toBeUndefined();
        } else {
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.fullNumber).toBeUndefined();
        }
      });
    });

    it("should provide appropriate error messages for invalid phone numbers", () => {
      // Test empty phone
      const emptyResult = validateInternationalPhone("", "PT");
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe("Phone number cannot be empty");

      // Test too long phone
      const longResult = validateInternationalPhone("12345678901234567890", "PT");
      expect(longResult.isValid).toBe(false);
      expect(longResult.error).toBe("Phone number too long");

      // Test invalid format
      const invalidResult = validateInternationalPhone("123", "PT");
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain("Invalid format for Portugal");
      expect(invalidResult.error).toContain("912345678");
    });

    it("should handle non-digit characters in phone input", () => {
      // Test that the validation function strips non-digit characters correctly
      const testCases = [
        { input: "912 345 678", country: "PT", expected: "+351912345678" },
        { input: "11-98765-4321", country: "BR", expected: "+5511987654321" },
        { input: "7911.123.456", country: "GB", expected: "+447911123456" },
        { input: "151 123 456 78", country: "DE", expected: "+4915112345678" },
        { input: "6 12 34 56 78", country: "FR", expected: "+33612345678" },
      ];

      testCases.forEach(testCase => {
        const result = validateInternationalPhone(testCase.input, testCase.country);
        expect(result.isValid).toBe(true);
        expect(result.fullNumber).toBe(testCase.expected);
      });
    });
  });

  describe("Country detection from existing phone numbers", () => {
    it("should detect country code from international phone numbers", () => {
      const testPhones = [
        { phone: "+351912345678", expectedCountry: "PT", expectedLocal: "912345678" },
        { phone: "+5511987654321", expectedCountry: "BR", expectedLocal: "11987654321" },
        { phone: "+447911123456", expectedCountry: "GB", expectedLocal: "7911123456" },
        { phone: "+4915112345678", expectedCountry: "DE", expectedLocal: "15112345678" },
        { phone: "+33612345678", expectedCountry: "FR", expectedLocal: "612345678" },
      ];

      testPhones.forEach(testCase => {
        // Simulate the country detection logic from the component
        let detectedCountry = "PT"; // Default
        let localPhone = testCase.phone;
        
        if (testCase.phone) {
          for (const [countryCode, config] of Object.entries(COUNTRY_CONFIGS)) {
            if (testCase.phone.startsWith(config.dialCode)) {
              detectedCountry = countryCode;
              localPhone = testCase.phone.substring(config.dialCode.length);
              break;
            }
          }
        }

        expect(detectedCountry).toBe(testCase.expectedCountry);
        expect(localPhone).toBe(testCase.expectedLocal);
      });
    });

    it("should default to Portugal when no dial code is detected", () => {
      const localPhones = ["912345678", "123456789", "", null, undefined];

      localPhones.forEach(phone => {
        let detectedCountry = "PT";
        let localPhone = phone || "";
        
        if (phone) {
          for (const [countryCode, config] of Object.entries(COUNTRY_CONFIGS)) {
            if (phone.startsWith(config.dialCode)) {
              detectedCountry = countryCode;
              localPhone = phone.substring(config.dialCode.length);
              break;
            }
          }
        }

        expect(detectedCountry).toBe("PT");
        expect(localPhone).toBe(phone || "");
      });
    });

    it("should handle edge cases in country detection", () => {
      const edgeCases = [
        { phone: "+3519123456789999", expectedCountry: "PT", expectedLocal: "9123456789999" }, // Extra long
        { phone: "+351", expectedCountry: "PT", expectedLocal: "" }, // Just dial code
        { phone: "+999123456789", expectedCountry: "PT", expectedLocal: "+999123456789" }, // Unknown dial code
      ];

      edgeCases.forEach(testCase => {
        let detectedCountry = "PT";
        let localPhone = testCase.phone;
        
        if (testCase.phone) {
          for (const [countryCode, config] of Object.entries(COUNTRY_CONFIGS)) {
            if (testCase.phone.startsWith(config.dialCode)) {
              detectedCountry = countryCode;
              localPhone = testCase.phone.substring(config.dialCode.length);
              break;
            }
          }
        }

        expect(detectedCountry).toBe(testCase.expectedCountry);
        expect(localPhone).toBe(testCase.expectedLocal);
      });
    });
  });

  describe("Form submission data structure", () => {
    it("should format barber data correctly for API submission", () => {
      // Test data that would be submitted to createBarber/updateBarber
      const formData = {
        name: "João Silva",
        description: "Beard specialist",
        phone: "912345678",
        instagram: "@joao_barber",
        imageUrl: "http://example.com/photo.jpg",
      };

      const selectedCountry = "PT";

      // Simulate validation and formatting
      const phoneValidation = validateInternationalPhone(formData.phone, selectedCountry);
      
      expect(phoneValidation.isValid).toBe(true);
      
      const dataToSubmit = {
        ...formData,
        phone: phoneValidation.fullNumber,
      };

      // Verify the data structure that would be sent to the API
      expect(dataToSubmit).toEqual({
        name: "João Silva",
        description: "Beard specialist",
        phone: "+351912345678", // Should be international format
        instagram: "@joao_barber",
        imageUrl: "http://example.com/photo.jpg",
      });
    });

    it("should handle form submission with different countries", () => {
      const countries = ["PT", "BR", "GB", "DE", "FR"];
      const samplePhones = ["912345678", "11987654321", "7911123456", "15112345678", "612345678"];

      countries.forEach((country, index) => {
        const formData = {
          name: "Test Barber",
          description: "Expert",
          phone: samplePhones[index],
          instagram: "",
          imageUrl: "",
        };

        const phoneValidation = validateInternationalPhone(formData.phone, country);
        expect(phoneValidation.isValid).toBe(true);

        const dataToSubmit = {
          ...formData,
          phone: phoneValidation.fullNumber,
        };

        // Verify international formatting
        expect(dataToSubmit.phone).toContain(COUNTRY_CONFIGS[country].dialCode);
        expect(dataToSubmit.phone).toBe(phoneValidation.fullNumber);
      });
    });
  });

  describe("Country configuration integrity", () => {
    it("should have all required properties for each country", () => {
      const requiredProperties = ["code", "name", "dialCode", "phonePattern", "placeholder", "maxLength"];

      Object.values(COUNTRY_CONFIGS).forEach(config => {
        requiredProperties.forEach(prop => {
          expect(config).toHaveProperty(prop);
          expect((config as any)[prop]).toBeDefined();
        });
      });
    });

    it("should have unique dial codes for each country", () => {
      const dialCodes = Object.values(COUNTRY_CONFIGS).map(config => config.dialCode);
      const uniqueDialCodes = [...new Set(dialCodes)];
      
      expect(uniqueDialCodes.length).toBe(dialCodes.length);
    });

    it("should have reasonable max length limits", () => {
      Object.values(COUNTRY_CONFIGS).forEach(config => {
        expect(config.maxLength).toBeGreaterThan(0);
        expect(config.maxLength).toBeLessThan(20); // Reasonable upper bound
      });
    });

    it("should have valid regex patterns", () => {
      Object.values(COUNTRY_CONFIGS).forEach(config => {
        expect(config.phonePattern).toBeInstanceOf(RegExp);
        
        // Test that the pattern works with the provided placeholder
        const cleanPlaceholder = config.placeholder.replace(/\D/g, "");
        expect(config.phonePattern.test(cleanPlaceholder)).toBe(true);
      });
    });
  });

  describe("Error handling scenarios", () => {
    it("should handle invalid country codes gracefully", () => {
      const invalidCountries = ["XX", "INVALID", "", null, undefined];

      invalidCountries.forEach(country => {
        const result = validateInternationalPhone("912345678", country as string);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("Unsupported country code");
      });
    });

    it("should handle edge cases in phone validation", () => {
      const edgeCases = [
        { phone: "   ", country: "PT" },
        { phone: "abc123def456", country: "PT" },
      ];

      edgeCases.forEach(testCase => {
        const result = validateInternationalPhone(testCase.phone as string, testCase.country);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      // Test null and undefined separately to handle them properly
      expect(() => validateInternationalPhone(null as any, "PT")).toThrow();
      expect(() => validateInternationalPhone(undefined as any, "PT")).toThrow();
    });
  });
});