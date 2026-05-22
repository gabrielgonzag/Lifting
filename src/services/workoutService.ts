import { workoutRepository } from "../repositories/workoutRepository";
import type { AppSnapshot } from "../types";

export const workoutService = {
  loadUserSnapshot(userId: string) {
    return workoutRepository.loadSnapshot(userId);
  },
  saveUserSnapshot(userId: string, snapshot: AppSnapshot) {
    return workoutRepository.saveSnapshot(userId, snapshot);
  },
};
