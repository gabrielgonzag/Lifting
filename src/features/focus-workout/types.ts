import type { WorkoutPlan } from "../../types";

export type RestPreset = "compound_heavy" | "compound_medium" | "core" | "isolation";

export type FocusSet = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  weight: number;
  reps: number;
  restSeconds: number;
  restPreset: RestPreset;
  completed: boolean;
  isPr: boolean;
  prType: "reps" | "volume" | "weight";
};

export type FocusWorkoutPlan = Pick<WorkoutPlan, "id" | "title">;
