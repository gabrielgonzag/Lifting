import type { User } from "./user";

export type RelationStatus = "active" | "pending" | "inactive" | "removed";

export type CoachStudentRelation = {
  id: string;
  coachId: string;
  studentId: string;
  status: RelationStatus;
  createdAt: string;
  acceptedAt?: string;
  updatedAt: string;
};

export type StudentProfile = User & {
  goal: string;
  frequencyGoal: number;
  lastWorkoutAt?: string;
};

export type StudentFrequencyPoint = {
  label: string;
  workouts: number;
  target: number;
};

export type StudentProgressPoint = {
  label: string;
  exerciseName: string;
  load: number;
  volume: number;
  personalRecord: number;
};

export type StudentWorkoutHistory = {
  id: string;
  studentId: string;
  workoutPlanId: string;
  title: string;
  date: string;
  durationMinutes: number;
  volume: number;
  completedExercises: number;
};

export type StudentDashboard = {
  student: StudentProfile;
  relation: CoachStudentRelation;
  recentFrequency: string;
  lastWorkoutLabel: string;
  progressSummary: string;
  frequency: StudentFrequencyPoint[];
  progress: StudentProgressPoint[];
  history: StudentWorkoutHistory[];
};
