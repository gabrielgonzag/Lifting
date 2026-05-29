import type { Exercise, PersonalRecord, WorkoutSession } from "../../types";

export type WorkoutDnaArchetype = "balanced" | "builder" | "relentless" | "specialist" | "titan";

export type WorkoutDnaStyle = "balanced" | "consistency" | "hypertrophy" | "specialization" | "strength";

export type WorkoutDnaScore = {
  balance: number;
  consistency: number;
  strength: number;
  volume: number;
};

export type WorkoutDnaGroupStat = {
  group: string;
  sessions: number;
  sets: number;
  volume: number;
};

export type WorkoutDnaExerciseStat = {
  exerciseId: string;
  name: string;
  group: string;
  sessions: number;
  sets: number;
  volume: number;
};

export type WorkoutDnaInput = {
  exercises: Exercise[];
  personalRecords: PersonalRecord[];
  sessions: WorkoutSession[];
  streak?: number;
};

export type WorkoutDnaProfile = {
  archetype: WorkoutDnaArchetype;
  secondaryArchetype?: WorkoutDnaArchetype;
  summary: string;
  strengths: string[];
  attentionPoints: string[];
  dominantGroups: WorkoutDnaGroupStat[];
  neglectedGroups: WorkoutDnaGroupStat[];
  favoriteExercises: WorkoutDnaExerciseStat[];
  averageWeeklyFrequency: number;
  dominantStyle: WorkoutDnaStyle;
  scores: WorkoutDnaScore;
  totalVolume: number;
  totalSets: number;
  prCount: number;
  workoutCount: number;
};
