import type { BaseEntity } from "./database";

export type { AuthResult, AuthSession, LoginInput, Permission, ProtectedRoute, RegisterInput } from "./auth";
export type { CoachRouteView, CoachWorkspace } from "./coach";
export type { BaseEntity } from "./database";
export type { CoachInvite, InviteStatus } from "./invite";
export type { CoachNote, CoachNoteType, SharedWorkoutExercise, SharedWorkoutPlan } from "./sharedWorkout";
export type {
  CoachStudentRelation,
  RelationStatus,
  StudentDashboard,
  StudentFrequencyPoint,
  StudentProfile,
  StudentProgressPoint,
  StudentWorkoutHistory,
} from "./student";
export type { User, UserPlan, UserRole, UserStatus } from "./user";
export type { CoachTrainingContext, CoachWorkoutSyncPayload, WorkoutSyncResult } from "./workout";

export type Category = "membros superiores" | "membros inferiores";

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  category: Category;
  equipment: string;
  variation: string;
  isFavorite?: boolean;
  notes?: string;
};

export type SavedExercise = BaseEntity & {
  exerciseId: string;
  notes?: string;
};

export type WorkoutSet = {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  rest?: number;
  notes?: string;
  completed?: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
};

export type WorkoutSession = BaseEntity & {
  workoutPlanId: string;
  date: string;
  exercises: WorkoutExercise[];
};

export type WorkoutBlock = {
  id: string;
  color: string;
  exerciseIds: string[];
};

export type WorkoutPlan = BaseEntity & {
  title: string;
  description: string;
  color: string;
  muscleGroups: string[];
  blocks: WorkoutBlock[];
};

export type PersonalRecordType = "absolute_weight" | "estimated_1rm" | "set_volume";

export type PersonalRecord = BaseEntity & {
  exerciseId: string;
  exerciseName: string;
  type: PersonalRecordType;
  value: number;
  weight: number;
  reps: number;
  date: string;
};

export type AppView = "home" | "plans" | "workout" | "progress" | "settings";

export type CoachRoute =
  | "coach"
  | "coach/students"
  | `coach/students/${string}`
  | `coach/students/${string}/workouts`
  | `coach/students/${string}/progress`
  | "coach/invites";

export type AppRoute =
  | AppView
  | "login"
  | "register"
  | "reset-password"
  | "auth-success"
  | "auth-error"
  | "auth/callback"
  | "verify-email"
  | "professional"
  | "elite"
  | "admin"
  | CoachRoute;

export type AppSnapshot = {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
};
