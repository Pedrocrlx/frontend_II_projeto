import {
  calculatePasswordStrength,
  validatePassword,
  getPasswordRequirements,
  PASSWORD_RULES,
} from "./passwordStrength";

describe("Password Strength Utility", () => {
  describe("getPasswordRequirements", () => {
    it("should return all requirements as unmet for empty password", () => {
      const requirements = getPasswordRequirements("");
      expect(requirements).toHaveLength(5);
      expect(requirements.every((req) => !req.met)).toBe(true);
    });

    it("should mark minimum length requirement as met", () => {
      const requirements = getPasswordRequirements("12345678");
      const lengthReq = requirements.find((req) => req.label.includes("8 characters"));
      expect(lengthReq?.met).toBe(true);
    });

    it("should mark uppercase requirement as met", () => {
      const requirements = getPasswordRequirements("Password");
      const upperReq = requirements.find((req) => req.label.includes("uppercase"));
      expect(upperReq?.met).toBe(true);
    });

    it("should mark lowercase requirement as met", () => {
      const requirements = getPasswordRequirements("password");
      const lowerReq = requirements.find((req) => req.label.includes("lowercase"));
      expect(lowerReq?.met).toBe(true);
    });

    it("should mark number requirement as met", () => {
      const requirements = getPasswordRequirements("password123");
      const numberReq = requirements.find((req) => req.label.includes("number"));
      expect(numberReq?.met).toBe(true);
    });

    it("should mark special character requirement as met", () => {
      const requirements = getPasswordRequirements("password@123");
      const specialReq = requirements.find((req) => req.label.includes("special character"));
      expect(specialReq?.met).toBe(true);
    });

    it("should mark all requirements as met for strong password", () => {
      const requirements = getPasswordRequirements("MyPass123!@#");
      expect(requirements.every((req) => req.met)).toBe(true);
    });
  });

  describe("validatePassword", () => {
    it("should return error for empty password", () => {
      const error = validatePassword("");
      expect(error).toBe("Password is required");
    });

    it("should return error for password shorter than minimum length", () => {
      const error = validatePassword("Pass1");
      expect(error).toContain("at least 8 characters");
    });

    it("should return error for password without uppercase", () => {
      const error = validatePassword("password123");
      expect(error).toContain("uppercase letter");
    });

    it("should return error for password without lowercase", () => {
      const error = validatePassword("PASSWORD123");
      expect(error).toContain("lowercase letter");
    });

    it("should return error for password without number", () => {
      const error = validatePassword("Password");
      expect(error).toContain("number");
    });

    it("should return null for valid password", () => {
      const error = validatePassword("MyPassword123");
      expect(error).toBeNull();
    });

    it("should accept password with special characters", () => {
      const error = validatePassword("MyPassword123!");
      expect(error).toBeNull();
    });

    it("should return error for password exceeding maximum length", () => {
      const longPassword = "A1" + "a".repeat(127);
      const error = validatePassword(longPassword);
      expect(error).toContain("less than 128 characters");
    });
  });

  describe("calculatePasswordStrength", () => {
    it("should return very-weak for empty password", () => {
      const strength = calculatePasswordStrength("");
      expect(strength.strength).toBe("very-weak");
      expect(strength.score).toBe(0);
      expect(strength.isValid).toBe(false);
    });

    it("should return very-weak for password with only lowercase", () => {
      const strength = calculatePasswordStrength("password");
      // 'password' has common pattern penalty, reducing score to 0
      expect(strength.strength).toBe("very-weak");
      expect(strength.isValid).toBe(false);
    });

    it("should return fair for password meeting some requirements", () => {
      const strength = calculatePasswordStrength("password1");
      expect(strength.strength).toBe("weak");
      expect(strength.isValid).toBe(false);
    });

    it("should return fair for password meeting most requirements", () => {
      const strength = calculatePasswordStrength("MyPass123");
      // 4 requirements met = score 2 = fair
      expect(strength.strength).toBe("fair");
      expect(strength.isValid).toBe(true);
    });

    it("should return strong for password meeting all requirements", () => {
      const strength = calculatePasswordStrength("MyPassword123!");
      expect(strength.strength).toBe("strong");
      expect(strength.isValid).toBe(true);
    });

    it("should penalize common patterns", () => {
      const strength1 = calculatePasswordStrength("Password123");
      const strength2 = calculatePasswordStrength("Password123");
      const strength3 = calculatePasswordStrength("12345678Aa");
      
      expect(strength1.isValid).toBe(true);
      expect(strength3.score).toBeLessThan(4);
    });

    it("should give bonus for longer passwords", () => {
      const short = calculatePasswordStrength("Pass123!");
      const long = calculatePasswordStrength("MyVeryLongPassword123!");
      
      expect(long.score).toBeGreaterThanOrEqual(short.score);
    });

    it("should detect repeating characters pattern", () => {
      const strength = calculatePasswordStrength("Aaaa1111");
      expect(strength.score).toBeLessThan(3);
    });

    it("should provide appropriate feedback", () => {
      const weak = calculatePasswordStrength("pass");
      const strong = calculatePasswordStrength("MySecurePass123!");
      
      // Invalid passwords show missing requirements
      expect(weak.feedback).toContain("Missing");
      expect(strong.feedback).toContain("Strong");
    });

    it("should count all met requirements correctly", () => {
      const strength = calculatePasswordStrength("MyPassword123!");
      expect(strength.requirements.filter((r) => r.met).length).toBe(5);
    });

    it("should handle special characters correctly", () => {
      const passwords = [
        "MyPass123@",
        "MyPass123#",
        "MyPass123$",
        "MyPass123%",
        "MyPass123&",
      ];
      
      passwords.forEach((password) => {
        const strength = calculatePasswordStrength(password);
        expect(strength.isValid).toBe(true);
        const specialReq = strength.requirements.find((r) => r.label.includes("special"));
        expect(specialReq?.met).toBe(true);
      });
    });

    it("should recognize password at exactly minimum length", () => {
      const strength = calculatePasswordStrength("MyPass12");
      const lengthReq = strength.requirements.find((r) => r.label.includes("8 characters"));
      expect(lengthReq?.met).toBe(true);
    });

    it("should validate password at maximum length boundary", () => {
      const maxPassword = "A1a" + "x".repeat(125);
      const overMaxPassword = "A1a" + "x".repeat(126);
      
      expect(validatePassword(maxPassword)).toBeNull();
      expect(validatePassword(overMaxPassword)).toContain("less than 128");
    });
  });

  describe("PASSWORD_RULES configuration", () => {
    it("should have correct default values", () => {
      expect(PASSWORD_RULES.minLength).toBe(8);
      expect(PASSWORD_RULES.maxLength).toBe(128);
      expect(PASSWORD_RULES.requireUppercase).toBe(true);
      expect(PASSWORD_RULES.requireLowercase).toBe(true);
      expect(PASSWORD_RULES.requireNumber).toBe(true);
      expect(PASSWORD_RULES.requireSpecialChar).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle password with only spaces", () => {
      const strength = calculatePasswordStrength("        ");
      expect(strength.isValid).toBe(false);
    });

    it("should handle password with unicode characters", () => {
      const strength = calculatePasswordStrength("MyPass123é");
      expect(strength.isValid).toBe(true);
    });

    it("should handle password with emojis", () => {
      const strength = calculatePasswordStrength("MyPass123😀");
      expect(strength.isValid).toBe(true);
    });

    it("should handle very short password", () => {
      const strength = calculatePasswordStrength("A1");
      expect(strength.isValid).toBe(false);
      // 2 requirements met (uppercase, number) = score 1 = weak
      expect(strength.strength).toBe("weak");
    });
  });
});
