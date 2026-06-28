import api from "@/config/axios.config";
import type { AuthResult, AuthCredentials } from "@/models/auth.model";
import type { User } from "@/models/user.model";

const PEPPER = import.meta.env.VITE_PASSWORD_PEPPER ?? "";

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResult> {
    const { data: users } = await api.get<User[]>("/users", {
      params: { username: credentials.username },
    });

    if (!users || users.length === 0) {
      return { success: false, error: "Invalid username or password." };
    }

    const user = users[0];
    const matches = await this.verifyPassword(
      credentials.password,
      user.password,
    );

    if (!matches) {
      return { success: false, error: "Invalid username or password." };
    }

    const { password: _pw, ...safeUser } = user;
    return { success: true, user: safeUser as User };
  },

  async register(credentials: AuthCredentials): Promise<AuthResult> {
    const { data: existing } = await api.get<User[]>("/users", {
      params: { username: credentials.username },
    });

    if (existing && existing.length > 0) {
      return { success: false, error: "Username is already taken." };
    }

    const hashedPassword = await this.hashPassword(credentials.password);

    const { data: newUser } = await api.post<User>("/users", {
      username: credentials.username,
      password: hashedPassword,
      role: "DEFAULT",
    });

    const { password: _pw, ...safeUser } = newUser;
    return { success: true, user: safeUser as User };
  },

  async isUsernameTaken(username: string): Promise<boolean> {
    const { data } = await api.get<User[]>("/users", {
      params: { username },
    });
    return data.length > 0;
  },

  async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    const hash = await this.hashPassword(plain);
    return hash === hashed;
  },

  async hashPassword(password: string): Promise<string> {
    const input = password + PEPPER;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },
};
