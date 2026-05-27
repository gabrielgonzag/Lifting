import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  clearCache: vi.fn(),
  emptyProgression: {
    achievements: [],
    currentTitleId: "iniciante",
    level: 1,
    prs: 0,
    setsCompleted: 0,
    streak: 0,
    titleIds: ["iniciante"],
    totalVolume: 0,
    totalXp: 0,
    workoutsCompleted: 0,
    xp: 0,
  },
  readCache: vi.fn(),
  syncOfficial: vi.fn(),
}));

const audit = vi.hoisted(() => ({
  record: vi.fn(),
}));

vi.mock("../repositories/gamificationRepository", () => ({
  gamificationRepository: repository,
}));

vi.mock("./auditService", () => ({
  auditService: audit,
}));

describe("gamification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads progression from the official repository and audits the sync", async () => {
    const official = { ...repository.emptyProgression, currentTitleId: "prime", level: 20, totalXp: 9500 };
    repository.syncOfficial.mockResolvedValue(official);
    const { gamificationService } = await import("./gamificationService");

    const result = await gamificationService.syncProgression("user-a");

    expect(repository.syncOfficial).toHaveBeenCalledWith("user-a");
    expect(result.currentTitleId).toBe("prime");
    expect(audit.record).toHaveBeenCalledWith({
      eventType: "gamification_update",
      metadata: { currentTitleId: "prime", level: 20, totalXp: 9500 },
      severity: "info",
      userId: "user-a",
    });
  });
});
