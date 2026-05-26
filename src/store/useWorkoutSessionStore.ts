import { create } from "zustand";
import { exercises } from "../data/exercises";
import type { WorkoutPlan, WorkoutSession } from "../types";
import { makeId } from "../utils/id";
import type { FocusSet, RestPreset } from "../features/focus-workout/types";

type WorkoutSessionState = {
  activePlan?: Pick<WorkoutPlan, "id" | "title">;
  currentIndex: number;
  focusSets: FocusSet[];
  restRemaining: number;
  startedAt?: string;
  startFocusWorkout: (plan: WorkoutPlan, previousSessions: WorkoutSession[]) => void;
  completeCurrentSet: () => FocusSet | undefined;
  skipRest: () => void;
  tickRest: () => void;
  updateCurrentSet: (patch: Partial<Pick<FocusSet, "isPr" | "prType" | "reps" | "weight">>) => void;
  resetFocusWorkout: () => void;
};

const restPresets: Record<RestPreset, number> = {
  compound_heavy: 180,
  compound_medium: 120,
  core: 45,
  isolation: 60,
};

const inferRestPreset = (exerciseName: string): RestPreset => {
  const name = exerciseName.toLowerCase();
  if (name.includes("abdominal") || name.includes("prancha") || name.includes("core")) return "core";
  if (name.includes("crucifixo") || name.includes("rosca") || name.includes("triceps") || name.includes("elevacao")) return "isolation";
  if (name.includes("agachamento") || name.includes("terra") || name.includes("supino") || name.includes("leg press")) return "compound_heavy";
  return "compound_medium";
};

const lastSetForExercise = (sessions: WorkoutSession[], exerciseId: string) =>
  sessions
    .flatMap((session) => session.exercises)
    .filter((entry) => entry.exerciseId === exerciseId)
    .flatMap((entry) => entry.sets)
    .filter((set) => set.weight > 0 && set.reps > 0)
    .sort((left, right) => right.weight * right.reps - left.weight * left.reps)[0];

const buildFocusSets = (plan: WorkoutPlan, sessions: WorkoutSession[]): FocusSet[] =>
  plan.blocks.flatMap((block) =>
    block.exerciseIds.flatMap((exerciseId) => {
      const exercise = exercises.find((item) => item.id === exerciseId);
      const exerciseName = exercise?.name ?? "Exercicio";
      const previous = lastSetForExercise(sessions, exerciseId);
      const preset = inferRestPreset(exerciseName);
      const baseWeight = previous?.weight ?? 0;
      const baseReps = previous?.reps ?? 8;
      return Array.from({ length: 4 }, (_, index) => ({
        completed: false,
        exerciseId,
        exerciseName,
        id: makeId("focus-set"),
        isPr: false,
        prType: "weight" as const,
        reps: index === 3 ? Math.max(1, baseReps - 2) : baseReps,
        restPreset: preset,
        restSeconds: restPresets[preset],
        setNumber: index + 1,
        totalSets: 4,
        weight: index === 3 && baseWeight ? baseWeight + 2.5 : baseWeight,
      }));
    }),
  );

export const useWorkoutSessionStore = create<WorkoutSessionState>()((set, get) => ({
  activePlan: undefined,
  currentIndex: 0,
  focusSets: [],
  restRemaining: 0,
  startedAt: undefined,
  completeCurrentSet: () => {
    const state = get();
    const current = state.focusSets[state.currentIndex];
    if (!current) return undefined;
    const nextSets = state.focusSets.map((setItem, index) =>
      index === state.currentIndex ? { ...setItem, completed: true } : setItem,
    );
    set({
      currentIndex: Math.min(state.currentIndex + 1, nextSets.length),
      focusSets: nextSets,
      restRemaining: current.restSeconds,
    });
    return { ...current, completed: true };
  },
  resetFocusWorkout: () => set({ activePlan: undefined, currentIndex: 0, focusSets: [], restRemaining: 0, startedAt: undefined }),
  skipRest: () => set({ restRemaining: 0 }),
  startFocusWorkout: (plan, previousSessions) =>
    set({
      activePlan: { id: plan.id, title: plan.title },
      currentIndex: 0,
      focusSets: buildFocusSets(plan, previousSessions),
      restRemaining: 0,
      startedAt: new Date().toISOString(),
    }),
  tickRest: () => set((state) => ({ restRemaining: Math.max(0, state.restRemaining - 1) })),
  updateCurrentSet: (patch) =>
    set((state) => ({
      focusSets: state.focusSets.map((setItem, index) => (index === state.currentIndex ? { ...setItem, ...patch } : setItem)),
    })),
}));
