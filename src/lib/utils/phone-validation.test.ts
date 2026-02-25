import { validateInternationalPhone, formatPhoneWithCountryCode, COUNTRY_CONFIGS } from "./phone-validation";

describe("validateInternationalPhone", () => {
  it("should validate a correct Portuguese phone number", () => {
    const result = validateInternationalPhone("912345678", "PT");
    expect(result.isValid).toBe(true);
    expect(result.fullNumber).toBe("+351912345678");
    expect(result.error).toBeUndefined();
  });

  it("should validate a correct Brazilian phone number", () => {
    const result = validateInternationalPhone("11987654321", "BR");
    expect(result.isValid).toBe(true);
    expect(result.fullNumber).toBe("+5511987654321");
    expect(result.error).toBeUndefined();
  });

  it("should clean input by removing non-digits", () => {
    const result = validateInternationalPhone("(11) 98765-4321", "BR");
    expect(result.isValid).toBe(true);
    expect(result.fullNumber).toBe("+5511987654321");
  });

  it("should reject empty phone number", () => {
    const result = validateInternationalPhone("", "PT");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Phone number cannot be empty");
  });

  it("should reject phone number that is too long", () => {
    const result = validateInternationalPhone("91234567890", "PT");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Phone number too long");
  });

  it("should reject invalid format for country", () => {
    const result = validateInternationalPhone("012345678", "PT");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid format for Portugal");
  });

  it("should reject unsupported country code", () => {
    const result = validateInternationalPhone("1234567890", "US");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Unsupported country code: US");
  });

  it("should validate all supported countries", () => {
    const testCases = [
      { country: "PT", phone: "912345678", expected: "+351912345678" },
      { country: "BR", phone: "11987654321", expected: "+5511987654321" },
      { country: "GB", phone: "7911123456", expected: "+447911123456" },
      { country: "DE", phone: "15112345678", expected: "+4915112345678" },
      { country: "FR", phone: "612345678", expected: "+33612345678" },
    ];

    testCases.forEach(({ country, phone, expected }) => {
      const result = validateInternationalPhone(phone, country);
      expect(result.isValid).toBe(true);
      expect(result.fullNumber).toBe(expected);
    });
  });

  it("should format full number as dialCode + cleanedNumber", () => {
    const result = validateInternationalPhone("912-345-678", "PT");
    expect(result.isValid).toBe(true);
    expect(result.fullNumber).toBe("+351912345678");
    expect(result.fullNumber?.length).toBe(
      COUNTRY_CONFIGS.PT.dialCode.length + 9
    );
  });
});

describe("formatPhoneWithCountryCode", () => {
  it("should concatenate dial code with local number", () => {
    const result = formatPhoneWithCountryCode("912345678", "+351");
    expect(result).toBe("+351912345678");
  });

  it("should work with different country codes", () => {
    expect(formatPhoneWithCountryCode("11987654321", "+55")).toBe("+5511987654321");
    expect(formatPhoneWithCountryCode("7911123456", "+44")).toBe("+447911123456");
    expect(formatPhoneWithCountryCode("15112345678", "+49")).toBe("+4915112345678");
    expect(formatPhoneWithCountryCode("612345678", "+33")).toBe("+33612345678");
  });

  it("should return string starting with +", () => {
    const result = formatPhoneWithCountryCode("912345678", "+351");
    expect(result[0]).toBe("+");
  });

  it("should have length equal to dialCode.length + localNumber.length", () => {
    const localNumber = "912345678";
    const dialCode = "+351";
    const result = formatPhoneWithCountryCode(localNumber, dialCode);
    expect(result.length).toBe(dialCode.length + localNumber.length);
  });

  it("should contain only + and digits", () => {
    const result = formatPhoneWithCountryCode("912345678", "+351");
    expect(result).toMatch(/^\+\d+$/);
  });
});
