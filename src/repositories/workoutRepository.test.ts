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

  it("persists edits to existing plans without restoring removed exercises", async () => {
    const { workoutRepository } = await import("./workoutRepository");
    const original: AppSnapshot = {
      personalRecords: [],
      plans: [
        {
          blocks: [{ color: "#B7F34D", exerciseIds: ["bench-press", "incline-press"], id: "block-a" }],
          color: "#B7F34D",
          createdAt: "2026-05-23T00:00:00.000Z",
          description: "Original",
          id: "plan-a",
          muscleGroups: ["Peito"],
          title: "Treino A",
          updatedAt: "2026-05-23T00:00:00.000Z",
          userId: "user-a",
        },
      ],
      sessions: [],
    };

    await workoutRepository.saveSnapshot("user-a", original);
    await workoutRepository.saveSnapshot("user-a", {
      ...original,
      plans: [
        {
          ...original.plans[0],
          blocks: [{ ...original.plans[0].blocks[0], exerciseIds: ["bench-press"] }],
          description: "Editado",
          title: "Treino editado",
          updatedAt: "2026-05-24T00:00:00.000Z",
        },
      ],
    });

    const loaded = await workoutRepository.loadSnapshot("user-a");

    expect(loaded.plans).toHaveLength(1);
    expect(loaded.plans[0].title).toBe("Treino editado");
    expect(loaded.plans[0].description).toBe("Editado");
    expect(loaded.plans[0].blocks[0].exerciseIds).toEqual(["bench-press"]);
  });

  it("persists workout sessions with nested sets, rest, PR and completion state", async () => {
    const { workoutRepository } = await import("./workoutRepository");
    const snapshot: AppSnapshot = {
      personalRecords: [],
      plans: [],
      sessions: [
        {
          createdAt: "2026-05-23T00:00:00.000Z",
          date: "2026-05-23T00:00:00.000Z",
          exercises: [
            {
              exerciseId: "bench-press",
              id: "entry-a",
              notes: "Boa execucao",
              sets: [
                {
                  completed: true,
                  id: "set-a",
                  isPr: true,
                  prType: "weight",
                  reps: 8,
                  rest: 120,
                  weight: 80,
                },
              ],
            },
          ],
          id: "session-a",
          updatedAt: "2026-05-23T00:00:00.000Z",
          userId: "user-a",
          workoutPlanId: "plan-a",
        },
      ],
    };

    await workoutRepository.saveSnapshot("user-a", snapshot);
    const loaded = await workoutRepository.loadSnapshot("user-a");
    const set = loaded.sessions[0].exercises[0].sets[0];

    expect(set.weight).toBe(80);
    expect(set.reps).toBe(8);
    expect(set.rest).toBe(120);
    expect(set.isPr).toBe(true);
    expect(set.prType).toBe("weight");
    expect(set.completed).toBe(true);
  });
});
