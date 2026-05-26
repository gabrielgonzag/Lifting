import { create } from "zustand";
import { achievementById } from "../achievements/achievements";

export type UserProgression = {
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  workoutsCompleted: number;
  prs: number;
  setsCompleted: number;
  achievements: string[];
};

type ProgressionEvent = {
  achievementIds: string[];
  leveledUp: boolean;
  xpGained: number;
};

type GamificationState = UserProgression & {
  awardWorkoutCompleted: (payload: { prs: number; sets: number; streak?: number; unlocked?: string[] }) => ProgressionEvent;
  resetProgression: () => void;
};

const storageKey = "lifting_user_progression";
export const XP_PER_LEVEL = 500;

const emptyProgression: UserProgression = {
  achievements: [],
  level: 1,
  prs: 0,
  setsCompleted: 0,
  streak: 0,
  totalXp: 0,
  workoutsCompleted: 0,
  xp: 0,
};

const readProgression = () => {
  if (typeof window === "undefined") return emptyProgression;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? { ...emptyProgression, ...(JSON.parse(raw) as Partial<UserProgression>) } : emptyProgression;
  } catch {
    return emptyProgression;
  }
};

const persistProgression = (state: UserProgression) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
};

export const levelTitle = (level: number) => {
  if (level <= 5) return "Iniciante";
  if (level <= 15) return "Consistente";
  if (level <= 30) return "Forte";
  if (level <= 50) return "Elite";
  return "Lenda";
};

const normalizeXp = (totalXp: number) => ({
  level: Math.floor(totalXp / XP_PER_LEVEL) + 1,
  xp: totalXp % XP_PER_LEVEL,
});

const unlockCandidates = (state: UserProgression) => {
  const ids: string[] = [];
  if (state.workoutsCompleted >= 1) ids.push("first-workout");
  if (state.streak >= 7) ids.push("seven-day-streak");
  if (state.streak >= 30) ids.push("thirty-day-streak");
  if (state.prs >= 10) ids.push("ten-prs");
  if (state.prs >= 50) ids.push("fifty-prs");
  if (state.setsCompleted >= 100) ids.push("hundred-sets");
  return ids;
};

export const useGamificationStore = create<GamificationState>()((set, get) => ({
  ...readProgression(),
  awardWorkoutCompleted: ({ prs, sets, streak, unlocked = [] }) => {
    const before = get();
    const baseXp = 100;
    const prXp = prs * 50;
    const nextBase: UserProgression = {
      achievements: before.achievements,
      level: before.level,
      prs: before.prs + prs,
      setsCompleted: before.setsCompleted + sets,
      streak: Math.max(before.streak, streak ?? before.streak),
      totalXp: before.totalXp,
      workoutsCompleted: before.workoutsCompleted + 1,
      xp: before.xp,
    };
    const candidates = [...unlockCandidates(nextBase), ...unlocked];
    const achievementIds = candidates.filter((id) => !before.achievements.includes(id));
    const achievementXp = achievementIds.reduce((total, id) => total + (achievementById.get(id)?.xpReward ?? 0), 0);
    const xpGained = baseXp + prXp + achievementXp;
    const totalXp = before.totalXp + xpGained;
    const normalized = normalizeXp(totalXp);
    const next: UserProgression = {
      ...nextBase,
      ...normalized,
      achievements: [...new Set([...before.achievements, ...achievementIds])],
      totalXp,
    };

    persistProgression(next);
    set(next);
    return { achievementIds, leveledUp: next.level > before.level, xpGained };
  },
  resetProgression: () => {
    persistProgression(emptyProgression);
    set(emptyProgression);
  },
}));

export const xpProgressPercent = (xp: number) => Math.round((xp / XP_PER_LEVEL) * 100);
