import { coachMockNotes, coachMockWorkouts } from "../data/coachMockData";
import { databaseClient } from "../services/databaseClient";
import type { CoachNote, SharedWorkoutExercise, SharedWorkoutPlan } from "../types";
import { makeId } from "../utils/id";

const readWorkouts = () => databaseClient.read<SharedWorkoutPlan[]>("shared_workout_plans", []);
const writeWorkouts = (items: SharedWorkoutPlan[]) => databaseClient.write("shared_workout_plans", items);
const readNotes = () => databaseClient.read<CoachNote[]>("coach_notes", []);
const writeNotes = (items: CoachNote[]) => databaseClient.write("coach_notes", items);

const seedWorkouts = (coachId: string) => {
  const seeded = coachMockWorkouts(coachId);
  writeWorkouts(seeded);
  return seeded;
};

const seedNotes = (coachId: string) => {
  const seeded = coachMockNotes(coachId);
  writeNotes(seeded);
  return seeded;
};

export const sharedWorkoutRepository = {
  listByCoach(coachId: string) {
    const workouts = readWorkouts().filter((item) => item.coachId === coachId);
    return workouts.length ? workouts : seedWorkouts(coachId);
  },
  listByStudent(coachId: string, studentId: string) {
    return this.listByCoach(coachId).filter((item) => item.studentId === studentId);
  },
  updateWorkout(plan: SharedWorkoutPlan) {
    const timestamp = new Date().toISOString();
    const nextPlan = { ...plan, updatedAt: timestamp };
    const items = readWorkouts();
    writeWorkouts(items.map((item) => (item.id === plan.id ? nextPlan : item)));
    return nextPlan;
  },
  duplicateWorkout(coachId: string, planId: string) {
    const source = this.listByCoach(coachId).find((item) => item.id === planId);
    if (!source) return undefined;
    const timestamp = new Date().toISOString();
    const copy: SharedWorkoutPlan = {
      ...source,
      id: makeId("shared"),
      workoutPlanId: makeId("plan"),
      title: `${source.title} copia`,
      exercises: source.exercises.map((exercise) => ({ ...exercise, id: makeId("exercise") })),
      createdAt: timestamp,
      updatedAt: timestamp,
      lastEditedBy: coachId,
    };
    writeWorkouts([copy, ...readWorkouts()]);
    return copy;
  },
  addExercise(planId: string, exercise: Omit<SharedWorkoutExercise, "id" | "order">) {
    const plan = readWorkouts().find((item) => item.id === planId);
    if (!plan) return undefined;
    const nextExercise = { ...exercise, id: makeId("exercise"), order: plan.exercises.length + 1 };
    return this.updateWorkout({ ...plan, exercises: [...plan.exercises, nextExercise] });
  },
  listNotes(coachId: string, studentId?: string) {
    const notes = readNotes().filter((item) => item.coachId === coachId);
    const seeded = notes.length ? notes : seedNotes(coachId);
    return studentId ? seeded.filter((item) => item.studentId === studentId) : seeded;
  },
  saveNote(note: Omit<CoachNote, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    const timestamp = new Date().toISOString();
    const items = readNotes();
    const next: CoachNote = {
      ...note,
      id: note.id ?? makeId("note"),
      createdAt: items.find((item) => item.id === note.id)?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    writeNotes(note.id ? items.map((item) => (item.id === note.id ? next : item)) : [next, ...items]);
    return next;
  },
  deleteNote(id: string) {
    writeNotes(readNotes().filter((item) => item.id !== id));
  },
};
