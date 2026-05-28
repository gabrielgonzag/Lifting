export type IronStreakStatus = "active" | "elite" | "forte" | "inactive" | "legendary";

export type XpBreakdownItem = {
  label: string;
  xp: number;
};

export type WorkoutXpInput = {
  activeMonths?: number;
  allExercisesCompleted?: boolean;
  completedSets: number;
  daysSinceLastWorkout?: number;
  durationMinutes?: number;
  streakDays?: number;
  totalSets: number;
  totalVolume: number;
  weeklyWorkouts?: number;
  workoutHour?: number;
};

export type WorkoutXpResult = {
  baseXp: number;
  breakdown: XpBreakdownItem[];
  ironStreak: {
    multiplier: number;
    status: IronStreakStatus;
  };
  totalXp: number;
};

export const XP_PER_LEVEL = 500;

export const levelFromTotalXp = (totalXp: number) => ({
  level: Math.floor(Math.max(0, totalXp) / XP_PER_LEVEL) + 1,
  xp: Math.max(0, totalXp) % XP_PER_LEVEL,
});

export const ironStreakForWeek = (workouts: number): { multiplier: number; status: IronStreakStatus } => {
  if (workouts >= 6) return { multiplier: 1.8, status: "legendary" };
  if (workouts >= 5) return { multiplier: 1.5, status: "elite" };
  if (workouts >= 4) return { multiplier: 1.25, status: "forte" };
  if (workouts >= 3) return { multiplier: 1.1, status: "active" };
  return { multiplier: 1, status: "inactive" };
};

const add = (breakdown: XpBreakdownItem[], label: string, xp: number) => {
  if (xp > 0) breakdown.push({ label, xp });
};

export const calculateWorkoutXp = (input: WorkoutXpInput): WorkoutXpResult => {
  const breakdown: XpBreakdownItem[] = [];
  const completedWorkout = input.completedSets > 0;

  add(breakdown, "Treino concluido", completedWorkout ? 100 : 0);
  add(breakdown, "Sem series incompletas", completedWorkout && input.completedSets === input.totalSets ? 25 : 0);
  add(breakdown, "Treino acima de 45 minutos", (input.durationMinutes ?? 0) >= 45 ? 20 : 0);
  add(breakdown, "Treino acima de 90 minutos", (input.durationMinutes ?? 0) >= 90 ? 40 : 0);
  add(breakdown, "Todos os exercicios completos", input.allExercisesCompleted ? 50 : 0);

  add(breakdown, "Volume medio", input.totalVolume >= 5_000 ? 20 : 0);
  add(breakdown, "Volume alto", input.totalVolume >= 15_000 ? 50 : 0);
  add(breakdown, "Volume extremo", input.totalVolume >= 30_000 ? 100 : 0);

  add(breakdown, "3 dias seguidos", (input.streakDays ?? 0) >= 3 ? 50 : 0);
  add(breakdown, "7 dias seguidos", (input.streakDays ?? 0) >= 7 ? 150 : 0);
  add(breakdown, "14 dias seguidos", (input.streakDays ?? 0) >= 14 ? 350 : 0);
  add(breakdown, "30 dias seguidos", (input.streakDays ?? 0) >= 30 ? 1_000 : 0);
  add(breakdown, "60 dias seguidos", (input.streakDays ?? 0) >= 60 ? 2_500 : 0);
  add(breakdown, "100 dias seguidos", (input.streakDays ?? 0) >= 100 ? 5_000 : 0);
  add(breakdown, "365 dias seguidos", (input.streakDays ?? 0) >= 365 ? 15_000 : 0);

  add(breakdown, "1 mes ativo", (input.activeMonths ?? 0) >= 1 ? 250 : 0);
  add(breakdown, "3 meses ativo", (input.activeMonths ?? 0) >= 3 ? 750 : 0);
  add(breakdown, "6 meses ativo", (input.activeMonths ?? 0) >= 6 ? 2_000 : 0);
  add(breakdown, "1 ano ativo", (input.activeMonths ?? 0) >= 12 ? 5_000 : 0);
  add(breakdown, "2 anos ativo", (input.activeMonths ?? 0) >= 24 ? 12_000 : 0);
  add(breakdown, "3 anos ativo", (input.activeMonths ?? 0) >= 36 ? 25_000 : 0);

  add(breakdown, "Retorno apos pausa", (input.daysSinceLastWorkout ?? 0) >= 7 ? 100 : 0);
  add(breakdown, "Treino cedo", (input.workoutHour ?? -1) >= 5 && (input.workoutHour ?? -1) < 7 ? 25 : 0);
  add(breakdown, "Treino tarde", (input.workoutHour ?? -1) >= 22 ? 25 : 0);
  add(breakdown, "Semana perfeita", (input.weeklyWorkouts ?? 0) >= 5 ? 500 : 0);

  const baseXp = breakdown.reduce((total, item) => total + item.xp, 0);
  const ironStreak = ironStreakForWeek(input.weeklyWorkouts ?? 0);
  return {
    baseXp,
    breakdown,
    ironStreak,
    totalXp: Math.round(baseXp * ironStreak.multiplier),
  };
};
