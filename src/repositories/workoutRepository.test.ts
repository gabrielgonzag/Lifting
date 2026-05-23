import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppSnapshot } from "../types";

const storage = vi.hoisted(() => new Map<string, unknown>());

vi.mock("../services/databaseClient", () => ({
  databaseClient: {
    read: <T>(collection: string, fallback: T) => (storage.has(collection) ? storage.get(collection) as T : fallback),
    readLegacy: <T>(_key: string, fallback: T) => fallback,
    write: (collection: string, value: unknown) => storage.set(collection, value),
  },
  supabase: undefined,
}));

describe("workout repository local adapter", () => {
  beforeEach(() => {
    storage.clear();
  });

  it("seeds new users with owned plans, sessions, and records", async () => {
    const { workoutRepository } = await import("./workoutRepository");

    const snapshot = await workoutRepository.loadSnapshot("user-a");

    expect(snapshot.plans.length).toBeGreaterThan(0);
    expect(snapshot.sessions.length).toBeGreaterThan(0);
    expect(snapshot.personalRecords.length).toBeGreaterThan(0);
    expect(snapshot.plans.every((plan) => plan.userId === "user-a")).toBe(true);
    expect(snapshot.sessions.every((session) => session.userId === "user-a")).toBe(true);
    expect(snapshot.personalRecords.every((record) => record.userId === "user-a")).toBe(true);
  });

  it("keeps workout snapshots isolated by user id", async () => {
    const { workoutRepository } = await import("./workoutRepository");
    const userA: AppSnapshot = {
      plans: [
        {
          id: "plan-a",
          userId: "user-a",
          title: "Treino A",
          description: "",
          color: "#ffffff",
          muscleGroups: ["Peito"],
          blocks: [],
          createdAt: "2026-05-23T00:00:00.000Z",
          updatedAt: "2026-05-23T00:00:00.000Z",
        },
      ],
      sessions: [],
      personalRecords: [],
    };

    await workoutRepository.saveSnapshot("user-a", userA);
    const loadedA = await workoutRepository.loadSnapshot("user-a");
    const loadedB = await workoutRepository.loadSnapshot("user-b");

    expect(loadedA.plans.map((plan) => plan.id)).toEqual(["plan-a"]);
    expect(loadedB.plans.every((plan) => plan.userId === "user-b")).toBe(true);
    expect(loadedB.plans.some((plan) => plan.id === "plan-a")).toBe(false);
  });
});
