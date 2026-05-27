import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGamificationStore } from "./useGamificationStore";

const service = vi.hoisted(() => ({
  cacheForUser: vi.fn(),
  clearCache: vi.fn(),
  syncProgression: vi.fn(),
}));

vi.mock("../../services/gamificationService", () => ({
  gamificationService: service,
}));

describe("gamification progression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGamificationStore.getState().resetProgression();
  });

  it("syncs official progression instead of trusting local state", async () => {
    service.syncProgression.mockResolvedValue({
      achievements: ["hundred-workouts"],
      currentTitleId: "prime",
      level: 21,
      prs: 12,
      setsCompleted: 320,
      streak: 9,
      titleIds: ["iniciante", "prime"],
      totalVolume: 150000,
      totalXp: 10000,
      workoutsCompleted: 100,
      xp: 0,
    });

    const event = await useGamificationStore.getState().awardWorkoutCompleted("user-a");

    expect(service.syncProgression).toHaveBeenCalledWith("user-a");
    expect(event.achievementIds).toContain("hundred-workouts");
    expect(useGamificationStore.getState().achievements).toContain("hundred-workouts");
    expect(useGamificationStore.getState().currentTitleId).toBe("prime");
  });
});
