export type UserRole = "casual" | "professional" | "enterprise_admin" | "instructor" | "admin";

export type UserPlan = "entry" | "core" | "coach" | "elite";

export type UserStatus = "pending_verification" | "active" | "suspended";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};
