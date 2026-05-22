import { create } from "zustand";
import type { AppSnapshot, WorkoutPlan, WorkoutSession } from "../types";
import { workoutService } from "../services/workoutService";
import { makeId } from "../utils/id";
import { buildRecordsFromSessions, recordsForSession } from "../utils/records";

type AppState = AppSnapshot & {
  userId?: string;
  loadUserData: (userId?: string) => void;
  createPlan: (plan: Omit<WorkoutPlan, "id" | "userId" | "createdAt" | "updatedAt">) => string;
  updatePlan: (plan: WorkoutPlan) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => void;
  saveSession: (session: Omit<WorkoutSession, "userId" | "createdAt" | "updatedAt">) => number;
  importSnapshot: (snapshot: AppSnapshot) => boolean;
  resetLocalData: () => void;
};

const isSnapshot = (value: unknown): value is AppSnapshot => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppSnapshot>;
  return (
    Array.isArray(candidate.plans) &&
    Array.isArray(candidate.sessions)
  );
};

const emptySnapshot: AppSnapshot = {
  plans: [],
  sessions: [],
  personalRecords: [],
};

const persist = (state: AppState, snapshot: AppSnapshot) => {
  if (state.userId) workoutService.saveUserSnapshot(state.userId, snapshot);
};

export const useAppStore = create<AppState>()((set) => ({
  ...emptySnapshot,
  userId: undefined,
  loadUserData: (userId) =>
    set(() => ({
      ...(userId ? workoutService.loadUserSnapshot(userId) : emptySnapshot),
      userId,
    })),
  createPlan: (plan) => {
    const id = makeId("plan");
    const createdAt = new Date().toISOString();
    set((state) => {
      if (!state.userId) return state;
      const next = { ...state, plans: [{ ...plan, id, userId: state.userId, createdAt, updatedAt: createdAt }, ...state.plans] };
      persist(state, next);
      return next;
    });
    return id;
  },
  updatePlan: (plan) =>
    set((state) => {
      const next = {
        ...state,
        plans: state.plans.map((item) =>
          item.id === plan.id ? { ...plan, updatedAt: new Date().toISOString() } : item,
        ),
      };
      persist(state, next);
      return next;
    }),
  deletePlan: (id) =>
    set((state) => {
      const next = { ...state, plans: state.plans.filter((plan) => plan.id !== id) };
      persist(state, next);
      return next;
    }),
  duplicatePlan: (id) =>
    set((state) => {
      const source = state.plans.find((plan) => plan.id === id);
      if (!source) return state;
      const timestamp = new Date().toISOString();
      const next = {
        ...state,
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
      persist(state, next);
      return next;
    }),
  saveSession: (session) => {
    let recordCount = 0;
    set((state) => {
      if (!state.userId) return state;
      const timestamp = new Date().toISOString();
      const nextSession: WorkoutSession = {
        ...session,
        userId: state.userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const personalRecords = [...state.personalRecords, ...recordsForSession(nextSession, state.personalRecords)];
      recordCount = personalRecords.length - state.personalRecords.length;
      const next = { ...state, sessions: [nextSession, ...state.sessions], personalRecords };
      persist(state, next);
      return next;
    });
    return recordCount;
  },
  importSnapshot: (snapshot) => {
    if (!isSnapshot(snapshot)) return false;
    const next = {
      userId: snapshot.plans[0]?.userId ?? snapshot.sessions[0]?.userId,
      plans: snapshot.plans,
      sessions: snapshot.sessions,
      personalRecords: Array.isArray(snapshot.personalRecords)
        ? snapshot.personalRecords
        : buildRecordsFromSessions(snapshot.sessions),
    };
    set((state) => {
      if (!state.userId) return state;
      const timestamp = new Date().toISOString();
      const owned = {
        ...state,
        plans: next.plans.map((plan) => ({ ...plan, userId: state.userId!, createdAt: plan.createdAt ?? timestamp, updatedAt: plan.updatedAt ?? timestamp })),
        sessions: next.sessions.map((session) => ({ ...session, userId: state.userId!, createdAt: session.createdAt ?? session.date, updatedAt: session.updatedAt ?? timestamp })),
        personalRecords: next.personalRecords.map((record) => ({ ...record, userId: state.userId!, createdAt: record.createdAt ?? record.date, updatedAt: record.updatedAt ?? timestamp })),
      };
      persist(state, owned);
      return owned;
    });
    return true;
  },
  resetLocalData: () =>
    set((state) => {
      const next = {
        userId: state.userId,
        plans: [] as WorkoutPlan[],
        sessions: [] as WorkoutSession[],
        personalRecords: [],
      };
      if (state.userId) {
        persist(state, next);
      }
      return next;
    }),
}));
