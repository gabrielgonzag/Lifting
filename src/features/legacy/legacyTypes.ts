import type { PersonalRecord, WorkoutSession } from "../../types";
import type { UserProgression } from "../gamification/useGamificationStore";

export type LegacyEventType =
  | "first_pr"
  | "first_workout"
  | "force_milestone"
  | "legendary_pr"
  | "streak_milestone"
  | "title_unlocked"
  | "volume_milestone"
  | "workout_milestone";

export type LegacyEvent = {
  id: string;
  type: LegacyEventType;
  title: string;
  description: string;
  occurredAt: string;
  impact: "high" | "medium" | "mythic";
  metadata?: Record<string, string | number>;
};

export type LegacyInput = {
  personalRecords: PersonalRecord[];
  progression: Pick<UserProgression, "currentTitleId" | "streak" | "titleIds" | "totalVolume" | "workoutsCompleted">;
  sessions: WorkoutSession[];
};

export type LegacySummary = {
  currentTitle: string;
  events: LegacyEvent[];
  featuredEvent?: LegacyEvent;
  totalMilestones: number;
  timelineLabel: string;
};
