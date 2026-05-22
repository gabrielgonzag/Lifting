import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { starterPlans, starterSessions } from "../data/mockData";
import { exercises } from "../data/exercises";
import type { AppSnapshot, ThemePreferences, WorkoutPlan, WorkoutSession } from "../types";
import { makeId } from "../utils/id";

type AppState = AppSnapshot & {
  createPlan: (plan: Omit<WorkoutPlan, "id" | "createdAt" | "updatedAt">) => string;
  updatePlan: (plan: WorkoutPlan) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => void;
  saveSession: (session: WorkoutSession) => void;
  toggleFavorite: (exerciseId: string) => void;
  updatePreferences: (preferences: Partial<ThemePreferences>) => void;
  importSnapshot: (snapshot: AppSnapshot) => boolean;
  resetLocalData: () => void;
};

const defaultPreferences: ThemePreferences = {
  accent: "#B7F34D",
  density: "comfortable",
  theme: "dark",
};

const initialSnapshot = (): AppSnapshot => ({
  plans: starterPlans,
  sessions: starterSessions,
  favoriteExerciseIds: [],
  preferences: defaultPreferences,
});

const isSnapshot = (value: unknown): value is AppSnapshot => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppSnapshot>;
  return (
    Array.isArray(candidate.plans) &&
    Array.isArray(candidate.sessions) &&
    Array.isArray(candidate.favoriteExerciseIds) &&
    Boolean(candidate.preferences)
  );
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialSnapshot(),
      createPlan: (plan) => {
        const id = makeId("plan");
        const createdAt = new Date().toISOString();
        set((state) => ({
          plans: [{ ...plan, id, createdAt, updatedAt: createdAt }, ...state.plans],
        }));
        return id;
      },
      updatePlan: (plan) =>
        set((state) => ({
          plans: state.plans.map((item) =>
            item.id === plan.id ? { ...plan, updatedAt: new Date().toISOString() } : item,
          ),
        })),
      deletePlan: (id) => set((state) => ({ plans: state.plans.filter((plan) => plan.id !== id) })),
      duplicatePlan: (id) =>
        set((state) => {
          const source = state.plans.find((plan) => plan.id === id);
          if (!source) return state;
          const timestamp = new Date().toISOString();
          return {
            plans: [
              {
                ...source,
                id: makeId("plan"),
                title: `${source.title} copia`,
                blocks: source.blocks.map((block) => ({ ...block, id: makeId("block") })),
                createdAt: timestamp,
                updatedAt: timestamp,
              },
              ...state.plans,
            ],
          };
        }),
      saveSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
      toggleFavorite: (exerciseId) =>
        set((state) => ({
          favoriteExerciseIds: state.favoriteExerciseIds.includes(exerciseId)
            ? state.favoriteExerciseIds.filter((id) => id !== exerciseId)
            : [...state.favoriteExerciseIds, exerciseId],
        })),
      updatePreferences: (preferences) =>
        set((state) => ({ preferences: { ...state.preferences, ...preferences } })),
      importSnapshot: (snapshot) => {
        if (!isSnapshot(snapshot)) return false;
        const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
        set({
          plans: snapshot.plans,
          sessions: snapshot.sessions,
          favoriteExerciseIds: snapshot.favoriteExerciseIds.filter((id) => exerciseIds.has(id)),
          preferences: { ...defaultPreferences, ...snapshot.preferences, theme: "dark" },
        });
        return true;
      },
      resetLocalData: () => set(initialSnapshot()),
    }),
    {
      name: "content-env-store",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ plans, sessions, favoriteExerciseIds, preferences }) => ({
        plans,
        sessions,
        favoriteExerciseIds,
        preferences,
      }),
    },
  ),
);
