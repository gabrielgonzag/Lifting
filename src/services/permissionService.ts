import type { Permission, User } from "../types";
import {
  canAccessAdvancedAnalytics,
  canAccessCoach,
  canAccessElite,
  canInviteStudents,
  canManageStudents,
  hasPermission,
} from "../utils/validators/permissionValidator";

export const permissionService = {
  has(user: User | undefined | null, permission: Permission) {
    return hasPermission(user, permission);
  },
  canAccessCoach,
  canAccessElite,
  canInviteStudents,
  canManageStudents,
  canAccessAdvancedAnalytics,
};
