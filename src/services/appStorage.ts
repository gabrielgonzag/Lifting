import type { AppSnapshot, PersonalRecord, WorkoutPlan, WorkoutSession } from "../types";

const keys = {
  legacy: "content-env-store",
  plans: "content_env_workout_plans",
  records: "content_env_personal_records",
  sessions: "content_env_workout_sessions",
};

const read = <T>(key: string) => {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
};

export const readStoredSnapshot = (): Partial<AppSnapshot> => {
  const plans = read<WorkoutPlan[]>(keys.plans);
  const sessions = read<WorkoutSession[]>(keys.sessions);
  const personalRecords = read<PersonalRecord[]>(keys.records);
  if (plans || sessions || personalRecords) return { plans, sessions, personalRecords };

  const legacy = read<{ state?: { plans?: WorkoutPlan[]; sessions?: WorkoutSession[] } }>(keys.legacy);
  return legacy?.state
    ? { plans: legacy.state.plans, sessions: legacy.state.sessions }
    : {};
};

export const writeSnapshot = ({ plans, sessions, personalRecords }: AppSnapshot) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keys.plans, JSON.stringify(plans));
  window.localStorage.setItem(keys.sessions, JSON.stringify(sessions));
  window.localStorage.setItem(keys.records, JSON.stringify(personalRecords));
};
