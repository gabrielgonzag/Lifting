import { gamificationRepository } from "../repositories/gamificationRepository";
import type { UserProgression } from "../features/gamification/useGamificationStore";
import { auditService } from "./auditService";

export const gamificationService = {
  cacheForUser(userId?: string) {
    return userId ? gamificationRepository.readCache(userId) : undefined;
  },

  async syncProgression(userId?: string): Promise<UserProgression> {
    if (!userId) return gamificationRepository.emptyProgression;
    const progression = await gamificationRepository.syncOfficial(userId);
    await auditService.record({
      eventType: "gamification_update",
      metadata: {
        currentTitleId: progression.currentTitleId,
        level: progression.level,
        totalXp: progression.totalXp,
      },
      severity: "info",
      userId,
    });
    return progression;
  },

  clearCache(userId?: string) {
    gamificationRepository.clearCache(userId);
  },
};
