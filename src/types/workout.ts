import type { SharedWorkoutPlan } from "./sharedWorkout";
import type { WorkoutSession } from "./index";

export type CoachTrainingContext = {
  id: string;
  coachId: string;
  studentId: string;
  studentName: string;
  startedAt: string;
};

export type CoachWorkoutSyncPayload = {
  context: CoachTrainingContext;
  plan: SharedWorkoutPlan;
  session: Omit<WorkoutSession, "userId" | "createdAt" | "updatedAt">;
};

export type WorkoutSyncResult = {
  ok: boolean;
  message: string;
};
