import type { User, UserPlan } from "../../types";

export const planOrder: Record<UserPlan, number> = {
  entry: 0,
  core: 1,
  coach: 2,
  elite: 3,
};

export const workoutPlanLimit = (plan: UserPlan) => (plan === "entry" ? 20 : Number.POSITIVE_INFINITY);

export const hasPlanAtLeast = (user: User | undefined | null, plan: UserPlan) =>
  Boolean(user && planOrder[user.plan] >= planOrder[plan]);

export const canCreateMoreWorkouts = (user: User | undefined | null, currentCount: number) =>
  Boolean(user && currentCount < workoutPlanLimit(user.plan));

export const workoutLimitMessage = (plan: UserPlan) =>
  plan === "entry"
    ? "Seu plano ENTRY inclui ate 20 fichas. Atualize para CORE para criar fichas ilimitadas."
    : "Seu plano permite fichas ilimitadas.";
