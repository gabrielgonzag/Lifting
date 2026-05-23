import { coachTrainingRepository } from "../repositories/coachTrainingRepository";
import type { CoachWorkoutSyncPayload, WorkoutSyncResult } from "../types";

export const studentProgressService = {
  syncWorkoutProgress(payload: CoachWorkoutSyncPayload): WorkoutSyncResult {
    // Future sync point: replace this repository write with Supabase upsert +
    // Realtime broadcast so coach and student devices receive the same update.
    coachTrainingRepository.recordCoachSession(payload);
    return { ok: true, message: "Evolucao do aluno sincronizada." };
  },
};
