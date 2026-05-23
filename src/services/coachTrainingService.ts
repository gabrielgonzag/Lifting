import { coachTrainingRepository } from "../repositories/coachTrainingRepository";
import { sharedWorkoutService } from "./sharedWorkoutService";
import { studentProgressService } from "./studentProgressService";
import type { CoachTrainingContext, CoachWorkoutSyncPayload, SharedWorkoutPlan, WorkoutSession } from "../types";
import { makeId } from "../utils/id";

export const coachTrainingService = {
  startStudentWorkout(coachId: string, studentId: string, studentName: string) {
    return coachTrainingRepository.setActiveContext({
      id: makeId("coach-training"),
      coachId,
      studentId,
      studentName,
      startedAt: new Date().toISOString(),
    });
  },
  getActiveContext() {
    return coachTrainingRepository.getActiveContext();
  },
  clearActiveContext() {
    coachTrainingRepository.clearActiveContext();
  },
  listActiveStudentPlans(context: CoachTrainingContext) {
    return sharedWorkoutService.listStudentWorkouts(context.coachId, context.studentId);
  },
  updateSeries(plan: SharedWorkoutPlan, exerciseId: string, sets: number) {
    return this.updateExercise(plan, exerciseId, { sets });
  },
  updateRepetitions(plan: SharedWorkoutPlan, exerciseId: string, reps: string) {
    return this.updateExercise(plan, exerciseId, { reps });
  },
  updateLoad(plan: SharedWorkoutPlan, exerciseId: string, suggestedLoad: number) {
    return this.updateExercise(plan, exerciseId, { suggestedLoad });
  },
  updateRest(plan: SharedWorkoutPlan, exerciseId: string, restSeconds: number) {
    return this.updateExercise(plan, exerciseId, { restSeconds });
  },
  updateExercise(plan: SharedWorkoutPlan, exerciseId: string, patch: Partial<SharedWorkoutPlan["exercises"][number]>) {
    const next = {
      ...plan,
      exercises: plan.exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, ...patch } : exercise)),
    };
    return sharedWorkoutService.updateWorkout(next);
  },
  completeWorkout(payload: CoachWorkoutSyncPayload) {
    return studentProgressService.syncWorkoutProgress(payload);
  },
  syncEvolution(context: CoachTrainingContext, plan: SharedWorkoutPlan, session: Omit<WorkoutSession, "userId" | "createdAt" | "updatedAt">) {
    return this.completeWorkout({ context, plan, session });
  },
};
