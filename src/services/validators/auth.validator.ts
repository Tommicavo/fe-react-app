import type { AuthCredentials, AuthValidationErrors } from "@/models/auth.model";

export interface AuthValidationResult {
  valid: boolean;
  errors: AuthValidationErrors;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export const authValidator = {
  validateLogin(data: AuthCredentials): AuthValidationResult {
    const errors: AuthValidationErrors = {};

    if (!data.username.trim()) {
      errors.username = "Username is required.";
    }

    if (!data.password) {
      errors.password = "Password is required.";
    }

    return { valid: Object.keys(errors).length === 0, errors };
  },

  validateRegister(
    data: AuthCredentials,
    isUsernameTaken?: boolean,
  ): AuthValidationResult {
    const errors: AuthValidationErrors = {};

    if (!data.username.trim()) {
      errors.username = "Username is required.";
    } else if (isUsernameTaken) {
      errors.username = "Username is already taken.";
    }

    if (!data.password) {
      errors.password = "Password is required.";
    } else if (!PASSWORD_REGEX.test(data.password)) {
      errors.password =
        "Password must be at least 8 characters and contain one uppercase letter, one lowercase letter, one number, and one symbol.";
    }

    return { valid: Object.keys(errors).length === 0, errors };
  },

  validatePasswordStrength(password: string): string | undefined {
    if (!password) return undefined;
    if (!PASSWORD_REGEX.test(password)) {
      return "Must be at least 8 chars with 1 uppercase, 1 lowercase, 1 number, 1 symbol.";
    }
    return undefined;
  },
};
