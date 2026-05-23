export type SharedWorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  order: number;
  sets: number;
  reps: string;
  suggestedLoad: number;
  restSeconds: number;
  notes?: string;
};

export type SharedWorkoutPlan = {
  id: string;
  coachId: string;
  studentId: string;
  workoutPlanId: string;
  title: string;
  description: string;
  exercises: SharedWorkoutExercise[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastEditedBy: string;
};

export type CoachNoteType = "general" | "workout" | "exercise" | "progression";

export type CoachNote = {
  id: string;
  coachId: string;
  studentId: string;
  workoutPlanId?: string;
  exerciseId?: string;
  content: string;
  type: CoachNoteType;
  createdAt: string;
  updatedAt: string;
};
