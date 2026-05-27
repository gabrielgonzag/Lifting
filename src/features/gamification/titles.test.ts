import { describe, expect, it } from "vitest";
import { getLegacyTitleProgress, isLegacyTitleUnlocked, legacyTitles } from "./titles";

describe("legacy bodybuilding titles", () => {
  it("starts at the first construction title and tracks the next title", () => {
    const progress = getLegacyTitleProgress({ level: 1, prs: 0, streak: 0, volume: 0, workouts: 0 });

    expect(progress.current.name).toBe("Iniciante");
    expect(progress.next?.name).toBe("Consistente");
    expect(progress.unlocked.map((title) => title.id)).toEqual(["iniciante"]);
  });

  it("unlocks mythic MR. OLYMPIA only with extreme historical volume", () => {
    const mrOlympia = legacyTitles.find((title) => title.id === "mr-olympia");

    expect(mrOlympia).toBeDefined();
    expect(mrOlympia && isLegacyTitleUnlocked(mrOlympia, { level: 99, prs: 200, streak: 365, volume: 999_999, workouts: 1000 })).toBe(false);
    expect(mrOlympia && isLegacyTitleUnlocked(mrOlympia, { level: 99, prs: 200, streak: 365, volume: 1_000_000, workouts: 1000 })).toBe(true);
  });
});
