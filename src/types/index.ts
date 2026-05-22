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

export type WorkoutSession = {
  id: string;
  workoutPlanId: string;
  date: string;
  exercises: WorkoutExercise[];
};

export type WorkoutBlock = {
  id: string;
  color: string;
  exerciseIds: string[];
};

export type WorkoutPlan = {
  id: string;
  title: string;
  description: string;
  color: string;
  muscleGroups: string[];
  blocks: WorkoutBlock[];
  createdAt: string;
  updatedAt: string;
};

export type PersonalRecordType = "absolute_weight" | "estimated_1rm" | "set_volume";

export type PersonalRecord = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  type: PersonalRecordType;
  value: number;
  weight: number;
  reps: number;
  date: string;
};

export type AppView = "home" | "plans" | "workout" | "progress" | "settings";

export type AppSnapshot = {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
};
