import { describe, expect, it } from "vitest";
import type { PersonalRecord, WorkoutSession } from "../../types";
import { generateLegacySummary } from "./legacyRules";

const session = (index: number): WorkoutSession => ({
  createdAt: `2026-01-${String(index).padStart(2, "0")}T10:00:00.000Z`,
  date: `2026-01-${String(index).padStart(2, "0")}T10:00:00.000Z`,
  exercises: [],
  id: `session-${index}`,
  updatedAt: `2026-01-${String(index).padStart(2, "0")}T10:00:00.000Z`,
  userId: "user-1",
  workoutPlanId: "plan-1",
});

const record = (id: string, value = 80): PersonalRecord => ({
  createdAt: "2026-01-03T10:00:00.000Z",
  date: "2026-01-03T10:00:00.000Z",
  exerciseId: "supino",
  exerciseName: "Supino reto",
  id,
  reps: 5,
  type: "estimated_1rm",
  updatedAt: "2026-01-03T10:00:00.000Z",
  userId: "user-1",
  value,
  weight: value,
});

describe("legacy system", () => {
  it("handles users without data", () => {
    const legacy = generateLegacySummary({
      personalRecords: [],
      progression: { currentTitleId: "iniciante", streak: 0, titleIds: ["iniciante"], totalVolume: 0, workoutsCompleted: 0 },
      sessions: [],
    });

    expect(legacy.events).toEqual([]);
    expect(legacy.timelineLabel).toBe("Aguardando o primeiro marco");
  });

  it("generates automatic workout, PR, streak, title and volume milestones", () => {
    const legacy = generateLegacySummary({
      personalRecords: [record("pr-1", 120)],
      progression: {
        currentTitleId: "foundation",
        streak: 7,
        titleIds: ["iniciante", "consistente", "foundation"],
        totalVolume: 25_000,
        workoutsCompleted: 10,
      },
      sessions: Array.from({ length: 10 }, (_, index) => session(index + 1)),
    });

    expect(legacy.events.map((event) => event.id)).toEqual(expect.arrayContaining(["workout-1", "workout-10", "first-pr", "streak-7", "volume-25000", "title-foundation"]));
    expect(legacy.featuredEvent).toBeTruthy();
  });

  it("prevents duplicated events from repeated dynamic rules", () => {
    const legacy = generateLegacySummary({
      personalRecords: [record("pr-1", 120), record("pr-2", 120)],
      progression: {
        currentTitleId: "consistente",
        streak: 30,
        titleIds: ["iniciante", "consistente", "consistente"],
        totalVolume: 75_000,
        workoutsCompleted: 10,
      },
      sessions: Array.from({ length: 10 }, (_, index) => session(index + 1)),
    });
    const ids = legacy.events.map((event) => event.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
