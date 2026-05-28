import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { databaseClient } from "./databaseClient";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => undefined),
}));

const makeStorage = () => {
  const values = new Map<string, string>();
  return {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
};

describe("databaseClient storage compatibility", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: makeStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads legacy lifting keys and migrates them to lifto keys", () => {
    window.localStorage.setItem("lifting_user_progression_cache", JSON.stringify({ user: { level: 12 } }));

    expect(databaseClient.read("user_progression", {})).toEqual({ user: { level: 12 } });
    expect(JSON.parse(window.localStorage.getItem("lifto_user_progression_cache") ?? "{}")).toEqual({ user: { level: 12 } });
  });

  it("reads legacy content env workout keys and migrates them to lifto keys", () => {
    window.localStorage.setItem("content_env_workout_plans", JSON.stringify([{ id: "plan-1" }]));

    expect(databaseClient.read("workout_plans", [])).toEqual([{ id: "plan-1" }]);
    expect(JSON.parse(window.localStorage.getItem("lifto_workout_plans") ?? "[]")).toEqual([{ id: "plan-1" }]);
  });
});
