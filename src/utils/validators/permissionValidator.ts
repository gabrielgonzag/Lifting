import type { Permission, User } from "../../types";
import { hasPlanAtLeast } from "./planValidator";

const adminRoles = new Set<User["role"]>(["admin"]);
const coachRoles = new Set<User["role"]>(["instructor", "professional"]);
const verifiedProfessionalStatuses = new Set<User["professionalVerificationStatus"]>(["auto_verified", "verified"]);
const pendingProfessionalStatuses = new Set<User["professionalVerificationStatus"]>(["expired", "manual_review", "pending", "rejected"]);

export const isVerifiedCoachProfessional = (user: User | undefined | null) =>
  Boolean(
    user &&
      coachRoles.has(user.role) &&
      hasPlanAtLeast(user, "coach") &&
      verifiedProfessionalStatuses.has(user.professionalVerificationStatus ?? "pending"),
  );

export const needsProfessionalVerification = (user: User | undefined | null) =>
  Boolean(
    user &&
      !isVerifiedCoachProfessional(user) &&
      pendingProfessionalStatuses.has(user.professionalVerificationStatus),
  );

export const hasPermission = (user: User | undefined | null, permission: Permission) => {
  if (!user || user.status === "suspended" || !user.emailVerified) return false;
  if (adminRoles.has(user.role)) return true;

  switch (permission) {
    case "workout:create_limited":
    case "workout:register":
    case "progress:basic":
    case "history:basic":
      return hasPlanAtLeast(user, "entry");
    case "workout:create_unlimited":
    case "progress:advanced":
    case "history:complete":
    case "export:premium_pdf":
    case "backup:complete":
      return hasPlanAtLeast(user, "core");
    case "coach:access":
    case "coach:manage_students":
    case "coach:create_invites":
    case "coach:edit_student_workouts":
    case "coach:view_student_analytics":
      return isVerifiedCoachProfessional(user);
    case "elite:access":
    case "elite:manage_units":
    case "elite:manage_instructors":
      return hasPlanAtLeast(user, "elite");
    case "admin:access":
      return user.role === "admin";
    default:
      return false;
  }
};

export const canAccessCoach = (user: User | undefined | null) => hasPermission(user, "coach:access");
export const canAccessElite = (user: User | undefined | null) => hasPermission(user, "elite:access");
export const canInviteStudents = (user: User | undefined | null) => hasPermission(user, "coach:create_invites");
export const canManageStudents = (user: User | undefined | null) => hasPermission(user, "coach:manage_students");
export const canAccessAdvancedAnalytics = (user: User | undefined | null) => hasPermission(user, "progress:advanced");
