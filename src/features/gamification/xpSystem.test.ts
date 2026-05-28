import { describe, expect, it } from "vitest";
import { calculateWorkoutXp, ironStreakForWeek } from "./xpSystem";

describe("xp system", () => {
  it("rewards completed training without making PR the main XP source", () => {
    const result = calculateWorkoutXp({
      allExercisesCompleted: true,
      completedSets: 12,
      durationMinutes: 50,
      prRanks: ["bronze"],
      totalSets: 12,
      totalVolume: 6_000,
    });

    expect(result.breakdown.some((item) => item.label === "Treino concluido" && item.xp === 100)).toBe(true);
    expect(result.breakdown.some((item) => item.label === "PR bronze" && item.xp === 10)).toBe(true);
    expect(result.totalXp).toBeGreaterThan(100);
    expect(result.totalXp).toBeLessThan(250);
  });

  it("applies iron streak multipliers only when frequency and PR requirements are met", () => {
    expect(ironStreakForWeek({ prs: 0, workouts: 5 })).toMatchObject({ multiplier: 1, status: "inactive" });
    expect(ironStreakForWeek({ prs: 1, workouts: 3 })).toMatchObject({ multiplier: 1.2, status: "active" });
    expect(ironStreakForWeek({ prs: 1, workouts: 4 })).toMatchObject({ multiplier: 1.4, status: "forte" });
    expect(ironStreakForWeek({ prs: 3, workouts: 5 })).toMatchObject({ multiplier: 2, status: "elite" });
  });
});
