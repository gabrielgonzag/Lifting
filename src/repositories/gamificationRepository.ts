import { databaseClient, supabase } from "../services/databaseClient";
import type { UserProgression } from "../features/gamification/useGamificationStore";

export type OfficialProgression = UserProgression & {
  currentTitleId: string;
  titleIds: string[];
};

type ProgressionRow = {
  current_title_id: string;
  level: number;
  prs: number;
  sets_completed: number;
  streak: number;
  total_volume: number;
  total_xp: number;
  user_id: string;
  workouts_completed: number;
  xp: number;
};

const emptyProgression: OfficialProgression = {
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

const rowToProgression = (row: ProgressionRow, achievements: string[], titleIds: string[]): OfficialProgression => ({
  achievements,
  currentTitleId: row.current_title_id,
  level: row.level,
  prs: row.prs,
  setsCompleted: row.sets_completed,
  streak: row.streak,
  titleIds: titleIds.length ? titleIds : [row.current_title_id],
  totalVolume: Number(row.total_volume ?? 0),
  totalXp: row.total_xp,
  workoutsCompleted: row.workouts_completed,
  xp: row.xp,
});

export const gamificationRepository = {
  emptyProgression,

  readCache(userId: string) {
    const cache = databaseClient.read<Record<string, OfficialProgression>>("user_progression", {});
    return cache[userId];
  },

  writeCache(userId: string, progression: OfficialProgression) {
    const cache = databaseClient.read<Record<string, OfficialProgression>>("user_progression", {});
    databaseClient.write("user_progression", { ...cache, [userId]: progression });
  },

  clearCache(userId?: string) {
    if (!userId) {
      databaseClient.write("user_progression", {});
      return;
    }
    const cache = databaseClient.read<Record<string, OfficialProgression>>("user_progression", {});
    const { [userId]: _removed, ...rest } = cache;
    databaseClient.write("user_progression", rest);
  },

  async syncOfficial(userId: string) {
    if (!supabase) return this.readCache(userId) ?? emptyProgression;

    const { data, error } = await supabase.rpc("sync_user_progression");
    if (error || !data) throw new Error(error?.message ?? "Unable to sync progression.");

    const [achievements, titles] = await Promise.all([
      supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
      supabase.from("user_titles").select("title_id").eq("user_id", userId),
    ]);

    const progression = rowToProgression(
      data as ProgressionRow,
      (achievements.data ?? []).map((item) => item.achievement_id as string),
      (titles.data ?? []).map((item) => item.title_id as string),
    );
    this.writeCache(userId, progression);
    return progression;
  },
};
