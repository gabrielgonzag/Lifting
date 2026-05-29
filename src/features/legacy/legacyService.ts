import type { PersonalRecord, WorkoutSession } from "../../types";
import type { UserProgression } from "../gamification/useGamificationStore";
import { generateLegacySummary } from "./legacyRules";

export const legacyService = {
  build(input: {
    personalRecords: PersonalRecord[];
    progression: Pick<UserProgression, "currentTitleId" | "streak" | "titleIds" | "totalVolume" | "workoutsCompleted">;
    sessions: WorkoutSession[];
  }) {
    return generateLegacySummary(input);
  },
};
