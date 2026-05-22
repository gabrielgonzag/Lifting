import type { DatabaseCollection } from "../types/database";

const collectionKeys: Record<DatabaseCollection, string> = {
  auth_session: "lifting_auth_session",
  users: "lifting_users",
  workout_plans: "content_env_workout_plans",
  workout_sessions: "content_env_workout_sessions",
  personal_records: "content_env_personal_records",
  saved_exercises: "content_env_saved_exercises",
};

const readRaw = (key: string) => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
};

const writeRaw = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
};

// This client is the only browser-storage adapter. A remote REST, Supabase,
// Firebase or PostgreSQL-backed adapter can replace it without changing UI.
export const databaseClient = {
  read<T>(collection: DatabaseCollection, fallback: T): T {
    try {
      const value = readRaw(collectionKeys[collection]);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write<T>(collection: DatabaseCollection, value: T) {
    writeRaw(collectionKeys[collection], JSON.stringify(value));
  },
  readLegacy<T>(key: string, fallback: T): T {
    try {
      const value = readRaw(key);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  },
};

