import { create } from "zustand";
import { gamificationService } from "../../services/gamificationService";
import { XP_PER_LEVEL } from "./xpSystem";

export type UserProgression = {
  currentTitleId: string;
  level: number;
  xp: number;
  totalXp: number;
  totalVolume: number;
  streak: number;
  workoutsCompleted: number;
  prs: number;
  setsCompleted: number;
  achievements: string[];
  titleIds: string[];
};

type ProgressionEvent = {
  achievementIds: string[];
  leveledUp: boolean;
  xpGained: number;
};

type GamificationState = UserProgression & {
  isSyncing: boolean;
  lastSyncedUserId?: string;
  awardWorkoutCompleted: (userId?: string) => Promise<ProgressionEvent>;
  clearProgression: (userId?: string) => void;
  resetProgression: () => void;
  syncProgression: (userId?: string) => Promise<UserProgression>;
};

export { XP_PER_LEVEL };

const emptyProgression: UserProgression = {
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
};

export const levelTitle = (level: number) => {
  if (level <= 5) return "Iniciante";
  if (level <= 15) return "Consistente";
  if (level <= 30) return "Forte";
  if (level <= 50) return "Elite";
  return "Lenda";
};

export const useGamificationStore = create<GamificationState>()((set, get) => ({
  ...emptyProgression,
  isSyncing: false,
  awardWorkoutCompleted: async (userId) => {
    const before = get();
    const next = await get().syncProgression(userId ?? before.lastSyncedUserId);
    return {
      achievementIds: next.achievements.filter((id) => !before.achievements.includes(id)),
      leveledUp: next.level > before.level,
      xpGained: Math.max(0, next.totalXp - before.totalXp),
    };
  },
  clearProgression: (userId) => {
    gamificationService.clearCache(userId);
    set({ ...emptyProgression, isSyncing: false, lastSyncedUserId: undefined });
  },
  resetProgression: () => {
    gamificationService.clearCache();
    set({ ...emptyProgression, isSyncing: false, lastSyncedUserId: undefined });
  },
  syncProgression: async (userId) => {
    if (!userId) {
      set({ ...emptyProgression, isSyncing: false, lastSyncedUserId: undefined });
      return emptyProgression;
    }
    const cached = gamificationService.cacheForUser(userId);
    if (cached) set({ ...cached, lastSyncedUserId: userId });
    set({ isSyncing: true, lastSyncedUserId: userId });
    try {
      const progression = await gamificationService.syncProgression(userId);
      set({ ...progression, isSyncing: false, lastSyncedUserId: userId });
      return progression;
    } catch {
      const fallback = cached ?? emptyProgression;
      set({ ...fallback, isSyncing: false, lastSyncedUserId: userId });
      return fallback;
    }
  },
}));

export const xpProgressPercent = (xp: number) => Math.round((xp / XP_PER_LEVEL) * 100);
