import type { CoachInvite } from "./invite";
import type { SharedWorkoutPlan, CoachNote } from "./sharedWorkout";
import type { StudentDashboard } from "./student";

export type CoachWorkspace = {
  students: StudentDashboard[];
  invites: CoachInvite[];
  sharedWorkouts: SharedWorkoutPlan[];
  notes: CoachNote[];
};

export type CoachRouteView = "overview" | "students" | "student" | "student-workouts" | "student-progress" | "invites";
