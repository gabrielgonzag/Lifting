import { create } from "zustand";
import { starterPlans, starterSessions } from "../data/mockData";
import { readStoredSnapshot, writeSnapshot } from "../services/appStorage";
import type { AppSnapshot, WorkoutPlan, WorkoutSession } from "../types";
import { makeId } from "../utils/id";
import { buildRecordsFromSessions, recordsForSession } from "../utils/records";

type AppState = AppSnapshot & {
  createPlan: (plan: Omit<WorkoutPlan, "id" | "createdAt" | "updatedAt">) => string;
  updatePlan: (plan: WorkoutPlan) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => void;
  saveSession: (session: WorkoutSession) => number;
  importSnapshot: (snapshot: AppSnapshot) => boolean;
  resetLocalData: () => void;
};

const seedSnapshot = (): AppSnapshot => {
  const stored = readStoredSnapshot();
  const sessions = stored.sessions ?? starterSessions;
  return {
    plans: stored.plans ?? starterPlans,
    sessions,
    personalRecords: stored.personalRecords ?? buildRecordsFromSessions(sessions),
  };
};

const isSnapshot = (value: unknown): value is AppSnapshot => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppSnapshot>;
  return (
    Array.isArray(candidate.plans) &&
    Array.isArray(candidate.sessions)
  );
};

export const useAppStore = create<AppState>()((set) => ({
  ...seedSnapshot(),
  createPlan: (plan) => {
    const id = makeId("plan");
    const createdAt = new Date().toISOString();
    set((state) => {
      const next = { plans: [{ ...plan, id, createdAt, updatedAt: createdAt }, ...state.plans] };
      writeSnapshot({ ...state, ...next });
      return next;
    });
    return id;
  },
  updatePlan: (plan) =>
    set((state) => {
      const next = {
        plans: state.plans.map((item) =>
          item.id === plan.id ? { ...plan, updatedAt: new Date().toISOString() } : item,
        ),
      };
      writeSnapshot({ ...state, ...next });
      return next;
    }),
  deletePlan: (id) =>
    set((state) => {
      const next = { plans: state.plans.filter((plan) => plan.id !== id) };
      writeSnapshot({ ...state, ...next });
      return next;
    }),
  duplicatePlan: (id) =>
    set((state) => {
      const source = state.plans.find((plan) => plan.id === id);
      if (!source) return state;
      const timestamp = new Date().toISOString();
      const next = {
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
      writeSnapshot({ ...state, ...next });
      return next;
    }),
  saveSession: (session) => {
    let recordCount = 0;
    set((state) => {
      const personalRecords = [...state.personalRecords, ...recordsForSession(session, state.personalRecords)];
      recordCount = personalRecords.length - state.personalRecords.length;
      const next = { sessions: [session, ...state.sessions], personalRecords };
      writeSnapshot({ ...state, ...next });
      return next;
    });
    return recordCount;
  },
  importSnapshot: (snapshot) => {
    if (!isSnapshot(snapshot)) return false;
    const next = {
      plans: snapshot.plans,
      sessions: snapshot.sessions,
      personalRecords: Array.isArray(snapshot.personalRecords)
        ? snapshot.personalRecords
        : buildRecordsFromSessions(snapshot.sessions),
    };
    writeSnapshot(next);
    set(next);
    return true;
  },
  resetLocalData: () =>
    set(() => {
      const next = {
        plans: [] as WorkoutPlan[],
        sessions: [] as WorkoutSession[],
        personalRecords: [],
      };
      writeSnapshot(next);
      return next;
    }),
}));
