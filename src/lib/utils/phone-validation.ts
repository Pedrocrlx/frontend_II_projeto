// Country configuration with validation patterns
export interface CountryConfig {
  code: string; // ISO 3166-1 alpha-2 code
  name: string; // Display name
  dialCode: string; // International dialing code
  phonePattern: RegExp; // Validation regex for phone numbers
  placeholder: string; // Example phone number format
  maxLength: number; // Maximum digits allowed
}

// Phone number with country context
export interface InternationalPhone {
  countryCode: string; // e.g., "PT", "BR"
  dialCode: string; // e.g., "+351", "+55"
  localNumber: string; // e.g., "912345678"
  fullNumber: string; // e.g., "+351912345678"
}

// Country configurations for supported countries
export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  PT: {
    code: "PT",
    name: "Portugal",
    dialCode: "+351",
    phonePattern: /^[1-9][0-9]{8}$/,
    placeholder: "912345678",
    maxLength: 9,
  },
  BR: {
    code: "BR",
    name: "Brazil",
    dialCode: "+55",
    phonePattern: /^[1-9][0-9]{10}$/,
    placeholder: "11987654321",
    maxLength: 11,
  },
  GB: {
    code: "GB",
    name: "England",
    dialCode: "+44",
    phonePattern: /^[1-9][0-9]{9,10}$/,
    placeholder: "7911123456",
    maxLength: 11,
  },
  DE: {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    phonePattern: /^[1-9][0-9]{9,11}$/,
    placeholder: "15112345678",
    maxLength: 12,
  },
  FR: {
    code: "FR",
    name: "France",
    dialCode: "+33",
    phonePattern: /^[1-9][0-9]{8}$/,
    placeholder: "612345678",
    maxLength: 9,
  },
};

/**
 * Validates an international phone number against country-specific patterns
 * 
 * @param localNumber - The phone number to validate (may contain non-digit characters)
 * @param countryCode - ISO 3166-1 alpha-2 country code (PT, BR, GB, DE, FR)
 * @returns Validation result with formatted full number if valid, or error message if invalid
 */
export function validateInternationalPhone(
  localNumber: string,
  countryCode: string
): { isValid: boolean; fullNumber?: string; error?: string } {
  // Step 1: Retrieve country configuration
  const countryConfig = COUNTRY_CONFIGS[countryCode];
  
  if (!countryConfig) {
    return {
      isValid: false,
      error: `Unsupported country code: ${countryCode}`,
    };
  }
  
  // Step 2: Clean input (remove non-digits)
  const cleanedNumber = localNumber.replace(/\D/g, "");
  
  // Step 3: Validate length
  if (cleanedNumber.length === 0) {
    return {
      isValid: false,
      error: "Phone number cannot be empty",
    };
  }
  
  if (cleanedNumber.length > countryConfig.maxLength) {
    return {
      isValid: false,
      error: "Phone number too long",
    };
  }
  
  // Step 4: Validate against country-specific pattern
  if (!countryConfig.phonePattern.test(cleanedNumber)) {
    return {
      isValid: false,
      error: `Invalid format for ${countryConfig.name}. Example: ${countryConfig.placeholder}`,
    };
  }
  
  // Step 5: Format full international number
  const fullNumber = countryConfig.dialCode + cleanedNumber;
  
  return {
    isValid: true,
    fullNumber: fullNumber,
  };
}

/**
 * Formats a phone number with country code
 * 
 * @param localNumber - The local phone number (digits only)
 * @param dialCode - The country dial code (e.g., "+351", "+55")
 * @returns Formatted international phone number (dialCode + localNumber)
 */
export function formatPhoneWithCountryCode(
  localNumber: string,
  dialCode: string
): string {
  return dialCode + localNumber;
}
