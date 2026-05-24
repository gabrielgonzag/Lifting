import type { User, UserPlan } from "../types";
import { activeStudentLimit, canCreateMoreWorkouts, canInviteMoreStudents, hasPlanAtLeast, workoutPlanLimit } from "../utils/validators/planValidator";

export const planService = {
  hasAtLeast(user: User | undefined | null, plan: UserPlan) {
    return hasPlanAtLeast(user, plan);
  },
  workoutLimit(plan: UserPlan) {
    return workoutPlanLimit(plan);
  },
  activeStudentLimit(plan: UserPlan) {
    return activeStudentLimit(plan);
  },
  canCreateMoreWorkouts(user: User | undefined | null, currentCount: number) {
    return canCreateMoreWorkouts(user, currentCount);
  },
  canInviteMoreStudents(user: User | undefined | null, activeStudentCount: number) {
    return canInviteMoreStudents(user, activeStudentCount);
  },
};
