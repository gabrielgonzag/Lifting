import { create } from "zustand";
import type { AppSnapshot, WorkoutPlan, WorkoutSession } from "../types";
import { workoutService } from "../services/workoutService";
import { makeId } from "../utils/id";
import { buildRecordsFromSessions, recordsForSession } from "../utils/records";

type AppState = AppSnapshot & {
  userId?: string;
  loadUserData: (userId?: string) => Promise<void>;
  createPlan: (plan: Omit<WorkoutPlan, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<string>;
  updatePlan: (plan: WorkoutPlan) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;
  duplicatePlan: (id: string) => Promise<boolean>;
  saveSession: (session: Omit<WorkoutSession, "userId" | "createdAt" | "updatedAt">) => Promise<number>;
  importSnapshot: (snapshot: AppSnapshot) => Promise<boolean>;
  resetLocalData: () => Promise<void>;
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

const saveOwnedSnapshot = async (userId: string | undefined, snapshot: AppSnapshot) => {
  if (!userId) return;
  await workoutService.saveUserSnapshot(userId, snapshot);
};

export const useAppStore = create<AppState>()((set, get) => ({
  ...emptySnapshot,
  userId: undefined,
  loadUserData: async (userId) => {
    const snapshot = userId ? await workoutService.loadUserSnapshot(userId) : emptySnapshot;
    set(() => ({ ...snapshot, userId }));
  },
  createPlan: async (plan) => {
    const id = makeId("plan");
    const createdAt = new Date().toISOString();
    const state = get();
    if (!state.userId) return "";
    const next = { ...state, plans: [{ ...plan, id, userId: state.userId, createdAt, updatedAt: createdAt }, ...state.plans] };
    set(next);
    try {
      await saveOwnedSnapshot(state.userId, next);
    } catch (error) {
      set(state);
      throw error;
    }
    return id;
  },
  updatePlan: async (plan) => {
    const state = get();
    if (!state.userId) return false;
    const timestamp = new Date().toISOString();
    const next = {
      ...state,
      plans: state.plans.map((item) =>
        item.id === plan.id ? { ...plan, userId: state.userId!, updatedAt: timestamp } : item,
      ),
    };
    set(next);
    try {
      await saveOwnedSnapshot(state.userId, next);
    } catch (error) {
      set(state);
      throw error;
    }
    return true;
  },
  deletePlan: async (id) => {
    const state = get();
    if (!state.userId) return false;
    const next = { ...state, plans: state.plans.filter((plan) => plan.id !== id) };
    set(next);
    try {
      await saveOwnedSnapshot(state.userId, next);
    } catch (error) {
      set(state);
      throw error;
    }
    return true;
  },
  duplicatePlan: async (id) => {
    const state = get();
    if (!state.userId) return false;
    const source = state.plans.find((plan) => plan.id === id);
    if (!source) return false;
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
    set(next);
    try {
      await saveOwnedSnapshot(state.userId, next);
    } catch (error) {
      set(state);
      throw error;
    }
    return true;
  },
  saveSession: async (session) => {
    const state = get();
    if (!state.userId) return 0;
    const timestamp = new Date().toISOString();
    const nextSession: WorkoutSession = {
      ...session,
      userId: state.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const personalRecords = [...state.personalRecords, ...recordsForSession(nextSession, state.personalRecords)];
    const recordCount = personalRecords.length - state.personalRecords.length;
    const next = { ...state, sessions: [nextSession, ...state.sessions], personalRecords };
    set(next);
    try {
      await saveOwnedSnapshot(state.userId, next);
    } catch (error) {
      set(state);
      throw error;
    }
    return recordCount;
  },
  importSnapshot: async (snapshot) => {
    if (!isSnapshot(snapshot)) return false;
    const next = {
      userId: snapshot.plans[0]?.userId ?? snapshot.sessions[0]?.userId,
      plans: snapshot.plans,
      sessions: snapshot.sessions,
      personalRecords: Array.isArray(snapshot.personalRecords)
        ? snapshot.personalRecords
        : buildRecordsFromSessions(snapshot.sessions),
    };
    const state = get();
    if (!state.userId) return false;
    const timestamp = new Date().toISOString();
    const owned = {
      ...state,
      plans: next.plans.map((plan) => ({ ...plan, userId: state.userId!, createdAt: plan.createdAt ?? timestamp, updatedAt: plan.updatedAt ?? timestamp })),
      sessions: next.sessions.map((session) => ({ ...session, userId: state.userId!, createdAt: session.createdAt ?? session.date, updatedAt: session.updatedAt ?? timestamp })),
      personalRecords: next.personalRecords.map((record) => ({ ...record, userId: state.userId!, createdAt: record.createdAt ?? record.date, updatedAt: record.updatedAt ?? timestamp })),
    };
    set(owned);
    try {
      await saveOwnedSnapshot(state.userId, owned);
    } catch (error) {
      set(state);
      throw error;
    }
    return true;
  },
  resetLocalData: async () => {
    const state = get();
    const next = {
      userId: state.userId,
      plans: [] as WorkoutPlan[],
      sessions: [] as WorkoutSession[],
      personalRecords: [],
    };
    set(next);
    try {
      await saveOwnedSnapshot(state.userId, next);
    } catch (error) {
      set(state);
      throw error;
    }
  },
}));
