import { beforeEach, describe, expect, it } from "vitest";
import { useGamificationStore } from "./useGamificationStore";

describe("gamification progression", () => {
  beforeEach(() => {
    useGamificationStore.getState().resetProgression();
  });

  it("unlocks the 100 workouts achievement", () => {
    let unlocked: string[] = [];

    for (let index = 0; index < 100; index += 1) {
      unlocked = useGamificationStore.getState().awardWorkoutCompleted({ prs: 0, sets: 1 }).achievementIds;
    }

    expect(unlocked).toContain("hundred-workouts");
    expect(useGamificationStore.getState().achievements).toContain("hundred-workouts");
  });
});
