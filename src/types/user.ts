export type UserRole = "casual" | "professional" | "admin";

export type UserPlan = "free" | "basic" | "professional" | "enterprise";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
};
