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
  | "saved_exercises"
  | "coach_students"
  | "coach_invites"
  | "shared_workout_plans"
  | "coach_notes"
  | "coach_student_progress"
  | "coach_training_context"
  | "professional_verifications"
  | "security_audit_logs"
  | "user_progression";
