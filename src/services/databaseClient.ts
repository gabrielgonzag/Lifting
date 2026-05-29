import { createClient } from "@supabase/supabase-js";
import type { DatabaseCollection } from "../types/database";

const collectionKeys: Record<DatabaseCollection, string> = {
  auth_session: "lifto_auth_session",
  users: "lifto_users",
  workout_plans: "lifto_workout_plans",
  workout_sessions: "lifto_workout_sessions",
  personal_records: "lifto_personal_records",
  saved_exercises: "lifto_saved_exercises",
  coach_students: "lifto_coach_students",
  coach_invites: "lifto_coach_invites",
  shared_workout_plans: "lifto_shared_workout_plans",
  coach_notes: "lifto_coach_notes",
  coach_student_progress: "lifto_coach_student_progress",
  coach_training_context: "lifto_coach_training_context",
  professional_verifications: "lifto_professional_verifications",
  security_audit_logs: "lifto_security_audit_logs",
  user_progression: "lifto_user_progression_cache",
};

const legacyCollectionKeys: Partial<Record<DatabaseCollection, string[]>> = {
  auth_session: ["lifting_auth_session"],
  users: ["lifting_users"],
  workout_plans: ["content_env_workout_plans"],
  workout_sessions: ["content_env_workout_sessions"],
  personal_records: ["content_env_personal_records"],
  saved_exercises: ["content_env_saved_exercises"],
  coach_students: ["lifting_coach_students"],
  coach_invites: ["lifting_coach_invites"],
  shared_workout_plans: ["lifting_shared_workout_plans"],
  coach_notes: ["lifting_coach_notes"],
  coach_student_progress: ["lifting_coach_student_progress"],
  coach_training_context: ["lifting_coach_training_context"],
  professional_verifications: ["lifting_professional_verifications"],
  security_audit_logs: ["lifting_security_audit_logs"],
  user_progression: ["lifting_user_progression_cache"],
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
      const currentKey = collectionKeys[collection];
      const value = readRaw(currentKey);
      if (value) return JSON.parse(value) as T;

      for (const legacyKey of legacyCollectionKeys[collection] ?? []) {
        const legacyValue = readRaw(legacyKey);
        if (legacyValue) {
          writeRaw(currentKey, legacyValue);
          return JSON.parse(legacyValue) as T;
        }
      }

      return fallback;
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: "pkce",
      },
    })
  : undefined;
