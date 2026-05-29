import { describe, expect, it } from "vitest";
import { exercises } from "../../data/exercises";
import type { PersonalRecord, WorkoutSession } from "../../types";
import { generateWorkoutDna } from "./workoutDnaRules";

const exercise = (group: string) => exercises.find((item) => item.muscleGroup === group)!;

const session = (id: string, date: string, items: Array<{ exerciseId: string; reps?: number; sets?: number; weight?: number }>): WorkoutSession => ({
  createdAt: date,
  date,
  exercises: items.map((item, index) => ({
    exerciseId: item.exerciseId,
    id: `${id}-ex-${index}`,
    sets: Array.from({ length: item.sets ?? 3 }, (_, setIndex) => ({
      completed: true,
      id: `${id}-set-${index}-${setIndex}`,
      reps: item.reps ?? 10,
      weight: item.weight ?? 40,
    })),
  })),
  id,
  updatedAt: date,
  userId: "user-1",
  workoutPlanId: "plan-1",
});

const record = (id: string, exerciseId: string, value: number): PersonalRecord => {
  const source = exercises.find((item) => item.id === exerciseId)!;
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    date: "2026-01-01T00:00:00.000Z",
    exerciseId,
    exerciseName: source.name,
    id,
    reps: 5,
    type: "estimated_1rm",
    updatedAt: "2026-01-01T00:00:00.000Z",
    userId: "user-1",
    value,
    weight: value,
  };
};

describe("workout dna", () => {
  it("returns a safe initial profile without training data", () => {
    const dna = generateWorkoutDna({ exercises, personalRecords: [], sessions: [] });

    expect(dna.archetype).toBe("balanced");
    expect(dna.workoutCount).toBe(0);
    expect(dna.scores.consistency).toBe(0);
    expect(dna.attentionPoints).toContain("Mais treinos vao deixar o DNA mais confiavel");
  });

  it("classifies high frequency athletes as relentless", () => {
    const peito = exercise("Peito");
    const sessions = Array.from({ length: 6 }, (_, index) =>
      session(`s-${index}`, `2026-01-0${index + 1}T10:00:00.000Z`, [{ exerciseId: peito.id, weight: 40 }]),
    );

    const dna = generateWorkoutDna({ exercises, personalRecords: [], sessions, streak: 8 });

    expect(dna.archetype).toBe("relentless");
    expect(dna.scores.consistency).toBeGreaterThanOrEqual(70);
  });

  it("detects specialized training when one group dominates volume", () => {
    const peito = exercise("Peito");
    const costas = exercise("Costas");
    const sessions = [
      session("s-1", "2026-01-01T10:00:00.000Z", [{ exerciseId: peito.id, weight: 100, sets: 5 }]),
      session("s-2", "2026-01-03T10:00:00.000Z", [{ exerciseId: peito.id, weight: 110, sets: 5 }]),
      session("s-3", "2026-01-05T10:00:00.000Z", [{ exerciseId: costas.id, weight: 20, sets: 1 }]),
    ];

    const dna = generateWorkoutDna({ exercises, personalRecords: [], sessions });

    expect(dna.archetype).toBe("specialist");
    expect(dna.dominantGroups[0].group).toBe("Peito");
    expect(dna.scores.balance).toBeLessThan(70);
  });

  it("uses PR history to identify strength-oriented athletes", () => {
    const peito = exercise("Peito");
    const costas = exercise("Costas");
    const sessions = [
      session("s-1", "2026-01-01T10:00:00.000Z", [{ exerciseId: peito.id, weight: 80 }]),
      session("s-2", "2026-01-08T10:00:00.000Z", [{ exerciseId: costas.id, weight: 85 }]),
    ];
    const records = Array.from({ length: 8 }, (_, index) => record(`pr-${index}`, index % 2 ? peito.id : costas.id, 100 + index));

    const dna = generateWorkoutDna({ exercises, personalRecords: records, sessions });

    expect(dna.archetype).toBe("titan");
    expect(dna.scores.strength).toBeGreaterThanOrEqual(80);
  });
});
