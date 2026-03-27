/**
 * Password Strength Utility
 * Validates password against security requirements and calculates strength score
 */

export interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4 (0=very weak, 1=weak, 2=fair, 3=good, 4=strong)
  strength: "very-weak" | "weak" | "fair" | "good" | "strong";
  requirements: PasswordRequirement[];
  isValid: boolean;
  feedback: string;
}

// Password validation rules (Moderate Security)
export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false, // Encouraged but not required
};

// Define password requirements
export const getPasswordRequirements = (password: string): PasswordRequirement[] => {
  return [
    {
      label: "At least 8 characters",
      regex: /.{8,}/,
      met: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      regex: /[A-Z]/,
      met: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      regex: /[a-z]/,
      met: /[a-z]/.test(password),
    },
    {
      label: "One number",
      regex: /[0-9]/,
      met: /[0-9]/.test(password),
    },
    {
      label: "One special character (recommended)",
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];
};

/**
 * Calculate password strength score
 * @param password - The password to evaluate
 * @returns PasswordStrength object with score, strength label, and requirements
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {
      score: 0,
      strength: "very-weak",
      requirements: getPasswordRequirements(password),
      isValid: false,
      feedback: "Password is required",
    };
  }

  const requirements = getPasswordRequirements(password);
  const metRequirements = requirements.filter((req) => req.met).length;

  // Calculate base score from requirements
  let score = 0;
  let isValid = true;
  const failedRequired: string[] = [];

  // Check required rules
  if (password.length < PASSWORD_RULES.minLength) {
    isValid = false;
    failedRequired.push("minimum length");
  }
  if (password.length > PASSWORD_RULES.maxLength) {
    isValid = false;
    failedRequired.push("maximum length");
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    isValid = false;
    failedRequired.push("uppercase letter");
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    isValid = false;
    failedRequired.push("lowercase letter");
  }
  if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(password)) {
    isValid = false;
    failedRequired.push("number");
  }

  // Score calculation based on met requirements
  if (metRequirements === 0) {
    score = 0; // Very weak
  } else if (metRequirements === 1) {
    score = 1; // Weak
  } else if (metRequirements === 2) {
    score = 1; // Weak
  } else if (metRequirements === 3) {
    score = 2; // Fair
  } else if (metRequirements === 4) {
    score = 2; // Fair (good requires 4 + length bonus)
  } else if (metRequirements === 5) {
    score = 3; // Good (strong requires special char + length bonus)
  }

  // Bonus points for longer passwords
  if (password.length >= 12) {
    score = Math.min(4, score + 1);
  }

  // Penalty for common patterns
  const commonPatterns = [
    /^123+/,
    /^abc+/i,
    /^password/i,
    /^qwerty/i,
    /(.)\1{3,}/, // Repeating characters
  ];

  const hasCommonPattern = commonPatterns.some((pattern) => pattern.test(password));
  if (hasCommonPattern) {
    score = Math.max(0, score - 1);
  }

  // Determine strength label
  let strength: PasswordStrength["strength"];
  let feedback: string;

  if (score === 0) {
    strength = "very-weak";
    feedback = "Very weak password";
  } else if (score === 1) {
    strength = "weak";
    feedback = "Weak password";
  } else if (score === 2) {
    strength = "fair";
    feedback = "Fair password";
  } else if (score === 3) {
    strength = "good";
    feedback = "Good password";
  } else {
    strength = "strong";
    feedback = "Strong password!";
  }

  // Override feedback if not valid
  if (!isValid) {
    feedback = `Missing: ${failedRequired.join(", ")}`;
  }

  return {
    score,
    strength,
    requirements,
    isValid,
    feedback,
  };
};

/**
 * Validate password meets all required rules
 * @param password - The password to validate
 * @returns Error message if invalid, null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < PASSWORD_RULES.minLength) {
    return `Password must be at least ${PASSWORD_RULES.minLength} characters`;
  }

  if (password.length > PASSWORD_RULES.maxLength) {
    return `Password must be less than ${PASSWORD_RULES.maxLength} characters`;
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  return null; // Valid
};
