export type UserRole = "casual" | "professional" | "enterprise_admin" | "instructor" | "admin";

export type UserPlan = "entry" | "core" | "coach" | "elite";

export type UserStatus = "pending_verification" | "active" | "suspended";

export type ProfessionalVerificationStatus =
  | "auto_verified"
  | "expired"
  | "manual_review"
  | "pending"
  | "rejected"
  | "verified";

export type User = {
  id: string;
  name: string;
  username?: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  goal?: UserGoal;
  experienceLevel?: UserExperienceLevel;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  professionalVerificationStatus?: ProfessionalVerificationStatus;
  createdAt: string;
  updatedAt: string;
};

export type UserGoal = "condicionamento" | "emagrecimento" | "forca" | "hipertrofia" | "saude_geral";

export type UserExperienceLevel = "atleta" | "avancado" | "iniciante" | "intermediario";

export type EditableUserProfile = Pick<User, "avatarUrl" | "bio" | "name" | "username">;
