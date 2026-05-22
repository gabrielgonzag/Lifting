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

export type InviteStatus = "pending" | "accepted" | "expired" | "canceled";

export type CoachStudentRelation = {
  id: string;
  coachId: string;
  studentId: string;
  status: InviteStatus;
  inviteCode: string;
  createdAt: string;
  acceptedAt?: string;
};

