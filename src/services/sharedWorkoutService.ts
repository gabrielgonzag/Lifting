import { sharedWorkoutRepository } from "../repositories/sharedWorkoutRepository";
import type { CoachNote, SharedWorkoutPlan } from "../types";

export const sharedWorkoutService = {
  listStudentWorkouts(coachId: string, studentId: string) {
    return sharedWorkoutRepository.listByStudent(coachId, studentId);
  },
  updateWorkout(plan: SharedWorkoutPlan) {
    // Future sync point: publish this mutation through Supabase Realtime,
    // Firebase Realtime, WebSocket or an API event after persistence succeeds.
    return sharedWorkoutRepository.updateWorkout(plan);
  },
  duplicateWorkout(coachId: string, planId: string) {
    return sharedWorkoutRepository.duplicateWorkout(coachId, planId);
  },
  listNotes(coachId: string, studentId: string) {
    return sharedWorkoutRepository.listNotes(coachId, studentId);
  },
  saveNote(note: Omit<CoachNote, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    return sharedWorkoutRepository.saveNote(note);
  },
  deleteNote(id: string) {
    sharedWorkoutRepository.deleteNote(id);
  },
};
