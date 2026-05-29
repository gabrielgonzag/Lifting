import type { AppRoute } from "./index";
import type { User, UserPlan, UserRole } from "./user";

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
  plan?: UserPlan;
};

export type AuthResult = {
  ok: boolean;
  user?: User;
  message?: string;
  email?: string;
  requiresProfessionalVerification?: boolean;
  requiresEmailConfirmation?: boolean;
  redirecting?: boolean;
};

export type AuthSession = {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
};

export type Permission =
  | "workout:create_limited"
  | "workout:create_unlimited"
  | "workout:register"
  | "progress:basic"
  | "progress:advanced"
  | "history:basic"
  | "history:complete"
  | "export:premium_pdf"
  | "backup:complete"
  | "coach:access"
  | "coach:manage_students"
  | "coach:create_invites"
  | "coach:edit_student_workouts"
  | "coach:view_student_analytics"
  | "elite:access"
  | "elite:manage_units"
  | "elite:manage_instructors"
  | "admin:access";

export type ProtectedRoute = {
  route: AppRoute;
  requiresAuth: boolean;
  allowedPlans?: UserPlan[];
  allowedRoles?: UserRole[];
};
