export type BaseEntity = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type DatabaseCollection =
  | "auth_session"
  | "users"
  | "workout_plans"
  | "workout_sessions"
  | "personal_records"
  | "saved_exercises";

