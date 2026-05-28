import { describe, expect, it } from "vitest";
import { calculateWorkoutXp, ironStreakForWeek } from "./xpSystem";

describe("xp system", () => {
  it("rewards discipline and duration without using PR for XP", () => {
    const result = calculateWorkoutXp({
      allExercisesCompleted: true,
      completedSets: 12,
      durationMinutes: 95,
      totalSets: 12,
      totalVolume: 6_000,
    });

    expect(result.breakdown.some((item) => item.label === "Treino concluido" && item.xp === 100)).toBe(true);
    expect(result.breakdown.some((item) => item.label.includes("PR"))).toBe(false);
    expect(result.breakdown.some((item) => item.label === "Treino acima de 90 minutos" && item.xp === 40)).toBe(true);
    expect(result.totalXp).toBeGreaterThan(100);
  });

  it("applies iron streak multipliers from weekly frequency only", () => {
    expect(ironStreakForWeek(2)).toMatchObject({ multiplier: 1, status: "inactive" });
    expect(ironStreakForWeek(3)).toMatchObject({ multiplier: 1.1, status: "active" });
    expect(ironStreakForWeek(4)).toMatchObject({ multiplier: 1.25, status: "forte" });
    expect(ironStreakForWeek(5)).toMatchObject({ multiplier: 1.5, status: "elite" });
    expect(ironStreakForWeek(6)).toMatchObject({ multiplier: 1.8, status: "legendary" });
  });
});
