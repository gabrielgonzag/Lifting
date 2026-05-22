import type { User, UserRole } from "./user";

export type LoginInput = {
  email: string;
  password: string;
  asProfessional?: boolean;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, "casual" | "professional">;
};

export type AuthResult = {
  ok: boolean;
  user?: User;
  message?: string;
  requiresEmailConfirmation?: boolean;
};
