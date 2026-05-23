import type { User, UserPlan } from "../types";
import { canCreateMoreWorkouts, hasPlanAtLeast, workoutPlanLimit } from "../utils/validators/planValidator";

export const planService = {
  hasAtLeast(user: User | undefined | null, plan: UserPlan) {
    return hasPlanAtLeast(user, plan);
  },
  workoutLimit(plan: UserPlan) {
    return workoutPlanLimit(plan);
  },
  canCreateMoreWorkouts(user: User | undefined | null, currentCount: number) {
    return canCreateMoreWorkouts(user, currentCount);
  },
};
