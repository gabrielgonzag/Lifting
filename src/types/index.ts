import type { BaseEntity } from "./database";

export type { AuthResult, LoginInput, RegisterInput } from "./auth";
export type { BaseEntity } from "./database";
export type {
  CoachStudentRelation,
  InviteStatus,
  User,
  UserPlan,
  UserRole,
} from "./user";

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

export type AppRoute =
  | AppView
  | "login"
  | "register"
  | "reset-password"
  | "professional"
  | "admin";

export type AppSnapshot = {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
};
