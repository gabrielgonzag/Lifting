import { starterPlans, starterSessions } from "../data/mockData";
import { databaseClient } from "../services/databaseClient";
import type { AppSnapshot, PersonalRecord, WorkoutPlan, WorkoutSession } from "../types";
import { buildRecordsFromSessions } from "../utils/records";

type LegacySnapshot = {
  state?: {
    plans?: Array<Omit<WorkoutPlan, "userId">>;
    sessions?: Array<Omit<WorkoutSession, "userId" | "createdAt" | "updatedAt">>;
  };
};

const withOwner = <T extends { id: string }>(
  item: T,
  userId: string,
  timestamp: string,
) => ({
  ...item,
  userId: "userId" in item && typeof item.userId === "string" ? item.userId : userId,
  createdAt: "createdAt" in item && typeof item.createdAt === "string" ? item.createdAt : timestamp,
  updatedAt: "updatedAt" in item && typeof item.updatedAt === "string" ? item.updatedAt : timestamp,
});

const ownerPlans = (items: WorkoutPlan[], userId: string) =>
  items.filter((item) => item.userId === userId);
const ownerSessions = (items: WorkoutSession[], userId: string) =>
  items.filter((item) => item.userId === userId);
const ownerRecords = (items: PersonalRecord[], userId: string) =>
  items.filter((item) => item.userId === userId);

const readAll = () => ({
  plans: databaseClient.read<WorkoutPlan[]>("workout_plans", []),
  sessions: databaseClient.read<WorkoutSession[]>("workout_sessions", []),
  personalRecords: databaseClient.read<PersonalRecord[]>("personal_records", []),
});

const initialSnapshot = (userId: string): AppSnapshot => {
  const timestamp = new Date().toISOString();
  const legacy = databaseClient.readLegacy<LegacySnapshot>("content-env-store", {});
  const plans = (legacy.state?.plans ?? starterPlans).map((plan) => ({
    ...withOwner(plan, userId, timestamp),
    userId,
  }));
  const sessions = (legacy.state?.sessions ?? starterSessions).map((session) => ({
    ...withOwner(session, userId, timestamp),
    userId,
  }));
  return {
    plans,
    sessions,
    personalRecords: buildRecordsFromSessions(sessions),
  };
};

export const workoutRepository = {
  loadSnapshot(userId: string): AppSnapshot {
    const stored = readAll();
    const plans = stored.plans.map((item) => withOwner(item, userId, item.createdAt ?? new Date().toISOString()));
    const sessions = stored.sessions.map((item) => withOwner(item, userId, item.createdAt ?? item.date));
    const records = stored.personalRecords.map((item) => withOwner(item, userId, item.createdAt ?? item.date));
    const snapshot = {
      plans: ownerPlans(plans, userId),
      sessions: ownerSessions(sessions, userId),
      personalRecords: ownerRecords(records, userId),
    };
    if (snapshot.plans.length || snapshot.sessions.length || snapshot.personalRecords.length) {
      this.saveSnapshot(userId, snapshot);
      return snapshot;
    }
    const seeded = initialSnapshot(userId);
    this.saveSnapshot(userId, seeded);
    return seeded;
  },
  saveSnapshot(userId: string, snapshot: AppSnapshot) {
    const stored = readAll();
    databaseClient.write("workout_plans", [
      ...stored.plans.filter((item) => item.userId && item.userId !== userId),
      ...snapshot.plans,
    ]);
    databaseClient.write("workout_sessions", [
      ...stored.sessions.filter((item) => item.userId && item.userId !== userId),
      ...snapshot.sessions,
    ]);
    databaseClient.write("personal_records", [
      ...stored.personalRecords.filter((item) => item.userId && item.userId !== userId),
      ...snapshot.personalRecords,
    ]);
  },
};
