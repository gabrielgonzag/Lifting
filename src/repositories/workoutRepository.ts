import { starterPlans, starterSessions } from "../data/mockData";
import { databaseClient, supabase } from "../services/databaseClient";
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

const isRemoteUser = (userId: string) => Boolean(supabase && !userId.startsWith("dev-"));

type PlanRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  color: string;
  muscle_groups: string[];
  blocks: WorkoutPlan["blocks"];
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  exercises: WorkoutSession["exercises"];
  created_at: string;
  updated_at: string;
};

type RecordRow = {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  type: PersonalRecord["type"];
  value: number;
  weight: number;
  reps: number;
  date: string;
  created_at: string;
  updated_at: string;
};

const planFromRow = (row: PlanRow): WorkoutPlan => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description,
  color: row.color,
  muscleGroups: row.muscle_groups,
  blocks: row.blocks,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const sessionFromRow = (row: SessionRow): WorkoutSession => ({
  id: row.id,
  userId: row.user_id,
  workoutPlanId: row.workout_plan_id,
  date: row.date,
  exercises: row.exercises,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const recordFromRow = (row: RecordRow): PersonalRecord => ({
  id: row.id,
  userId: row.user_id,
  exerciseId: row.exercise_id,
  exerciseName: row.exercise_name,
  type: row.type,
  value: row.value,
  weight: row.weight,
  reps: row.reps,
  date: row.date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const planToRow = (plan: WorkoutPlan) => ({
  id: plan.id,
  user_id: plan.userId,
  title: plan.title,
  description: plan.description,
  color: plan.color,
  muscle_groups: plan.muscleGroups,
  blocks: plan.blocks,
  created_at: plan.createdAt,
  updated_at: plan.updatedAt,
});

const sessionToRow = (session: WorkoutSession) => ({
  id: session.id,
  user_id: session.userId,
  workout_plan_id: session.workoutPlanId,
  date: session.date,
  exercises: session.exercises,
  created_at: session.createdAt,
  updated_at: session.updatedAt,
});

const recordToRow = (record: PersonalRecord) => ({
  id: record.id,
  user_id: record.userId,
  exercise_id: record.exerciseId,
  exercise_name: record.exerciseName,
  type: record.type,
  value: record.value,
  weight: record.weight,
  reps: record.reps,
  date: record.date,
  created_at: record.createdAt,
  updated_at: record.updatedAt,
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
  async loadSnapshot(userId: string): Promise<AppSnapshot> {
    if (isRemoteUser(userId) && supabase) {
      const client = supabase;
      const [plans, sessions, personalRecords] = await Promise.all([
        client.from("workout_plans").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
        client.from("workout_sessions").select("*").eq("user_id", userId).order("date", { ascending: false }),
        client.from("personal_records").select("*").eq("user_id", userId).order("date", { ascending: false }),
      ]);
      if (plans.error || sessions.error || personalRecords.error) {
        return { plans: [], sessions: [], personalRecords: [] };
      }
      return {
        plans: (plans.data as PlanRow[]).map(planFromRow),
        sessions: (sessions.data as SessionRow[]).map(sessionFromRow),
        personalRecords: (personalRecords.data as RecordRow[]).map(recordFromRow),
      };
    }
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
  async saveSnapshot(userId: string, snapshot: AppSnapshot) {
    if (isRemoteUser(userId) && supabase) {
      const client = supabase;
      const current = await Promise.all([
        client.from("workout_plans").select("id").eq("user_id", userId),
        client.from("workout_sessions").select("id").eq("user_id", userId),
        client.from("personal_records").select("id").eq("user_id", userId),
      ]);
      await Promise.all([
        snapshot.plans.length ? client.from("workout_plans").upsert(snapshot.plans.map(planToRow)) : Promise.resolve(),
        snapshot.sessions.length ? client.from("workout_sessions").upsert(snapshot.sessions.map(sessionToRow)) : Promise.resolve(),
        snapshot.personalRecords.length
          ? client.from("personal_records").upsert(snapshot.personalRecords.map(recordToRow))
          : Promise.resolve(),
        ...current.flatMap((result, index) => {
          if (result.error) return [];
          const presentIds = new Set(
            [snapshot.plans, snapshot.sessions, snapshot.personalRecords][index].map((item) => item.id),
          );
          const removed = result.data.map((item) => item.id).filter((id) => !presentIds.has(id));
          const table = ["workout_plans", "workout_sessions", "personal_records"][index];
          return removed.length ? [client.from(table).delete().in("id", removed).eq("user_id", userId)] : [];
        }),
      ]);
      return;
    }
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
