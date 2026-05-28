import { describe, expect, it } from "vitest";
import type { PersonalRecord, WorkoutSession } from "../types";
import { bestRecord, classifyPersonalRecord, estimatedOneRepMax, recordsForSession } from "./records";

const session: WorkoutSession = {
  id: "session-1",
  userId: "user-1",
  workoutPlanId: "plan-1",
  date: "2026-05-23T00:00:00.000Z",
  createdAt: "2026-05-23T00:00:00.000Z",
  updatedAt: "2026-05-23T00:00:00.000Z",
  exercises: [
    {
      id: "entry-1",
      exerciseId: "peito-1-supino-reto-com-barra",
      sets: [
        { id: "set-1", weight: 100, reps: 6, completed: true },
        { id: "set-2", weight: 140, reps: 0, completed: true },
        { id: "set-3", weight: 110, reps: 3, completed: false },
      ],
    },
  ],
};

describe("personal record calculations", () => {
  it("uses Epley formula only for valid weight and reps", () => {
    expect(estimatedOneRepMax(100, 6)).toBe(120);
    expect(estimatedOneRepMax(0, 6)).toBe(0);
    expect(estimatedOneRepMax(100, 0)).toBe(0);
  });

  it("creates absolute weight, 1RM, volume, and reps records from completed sets", () => {
    const records = recordsForSession(session, []);

    expect(records).toHaveLength(4);
    expect(bestRecord(records, "peito-1-supino-reto-com-barra", "absolute_weight")?.value).toBe(100);
    expect(bestRecord(records, "peito-1-supino-reto-com-barra", "estimated_1rm")?.value).toBe(120);
    expect(bestRecord(records, "peito-1-supino-reto-com-barra", "set_volume")?.value).toBe(600);
    expect(bestRecord(records, "peito-1-supino-reto-com-barra", "max_reps")?.value).toBe(6);
  });

  it("only returns records that beat previous bests", () => {
    const previous: PersonalRecord[] = [
      {
        id: "pr-1",
        userId: "user-1",
        exerciseId: "peito-1-supino-reto-com-barra",
        exerciseName: "Supino reto com barra",
        type: "absolute_weight",
        value: 120,
        weight: 120,
        reps: 1,
        date: "2026-05-01T00:00:00.000Z",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
    ];

    const records = recordsForSession(session, previous);

    expect(bestRecord(records, "peito-1-supino-reto-com-barra", "absolute_weight")).toBeUndefined();
    expect(bestRecord(records, "peito-1-supino-reto-com-barra", "estimated_1rm")?.value).toBe(120);
  });

  it("does not create official records from manual PR marks alone", () => {
    const previous: PersonalRecord[] = [
      {
        id: "pr-1",
        userId: "user-1",
        exerciseId: "peito-1-supino-reto-com-barra",
        exerciseName: "Supino reto com barra",
        type: "absolute_weight",
        value: 120,
        weight: 120,
        reps: 1,
        date: "2026-05-01T00:00:00.000Z",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
    ];
    const manualSession: WorkoutSession = {
      ...session,
      exercises: [
        {
          ...session.exercises[0],
          sets: [{ id: "manual-pr", weight: 100, reps: 5, completed: true, isPr: true, prType: "weight" }],
        },
      ],
    };

    const records = recordsForSession(manualSession, previous);

    expect(records.some((record) => record.type === "absolute_weight" && record.value === 100)).toBe(false);
  });

  it("rejects insignificant and absurd PR attempts", () => {
    const previous: PersonalRecord[] = [
      {
        id: "pr-1",
        userId: "user-1",
        exerciseId: "peito-1-supino-reto-com-barra",
        exerciseName: "Supino reto com barra",
        type: "absolute_weight",
        value: 100,
        weight: 100,
        reps: 6,
        date: "2026-05-01T00:00:00.000Z",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
    ];
    const tinyJump: WorkoutSession = {
      ...session,
      exercises: [
        {
          ...session.exercises[0],
          sets: [{ id: "tiny", weight: 101, reps: 6, completed: true }],
        },
      ],
    };
    const absurd: WorkoutSession = {
      ...session,
      exercises: [
        {
          ...session.exercises[0],
          sets: [{ id: "absurd", weight: 900, reps: 6, completed: true }],
        },
      ],
    };

    expect(recordsForSession(tinyJump, previous).some((record) => record.type === "absolute_weight")).toBe(false);
    expect(recordsForSession(absurd, []).some((record) => record.type === "absolute_weight")).toBe(false);
  });

  it("classifies PR relevance from improvement size", () => {
    expect(classifyPersonalRecord(101, 100)).toBe("bronze");
    expect(classifyPersonalRecord(105, 100)).toBe("silver");
    expect(classifyPersonalRecord(112, 100)).toBe("gold");
    expect(classifyPersonalRecord(125, 100)).toBe("legendary");
  });
});
