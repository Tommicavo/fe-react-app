import type { User } from "./user.model";

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthValidationErrors {
  username?: string;
  password?: string;
}
