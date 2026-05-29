import { exercises } from "../../data/exercises";
import type { PersonalRecord, WorkoutSession } from "../../types";
import { generateWorkoutDna } from "./workoutDnaRules";

export const workoutDnaService = {
  calculate(input: { personalRecords: PersonalRecord[]; sessions: WorkoutSession[]; streak?: number }) {
    return generateWorkoutDna({
      exercises,
      personalRecords: input.personalRecords,
      sessions: input.sessions,
      streak: input.streak,
    });
  },
};
