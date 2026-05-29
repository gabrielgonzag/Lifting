import type { WorkoutDnaArchetype, WorkoutDnaGroupStat, WorkoutDnaInput, WorkoutDnaProfile, WorkoutDnaStyle } from "./workoutDnaTypes";

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const archetypeLabels: Record<WorkoutDnaArchetype, string> = {
  balanced: "Equilibrado",
  builder: "Construtor",
  relentless: "Incansavel",
  specialist: "Especialista",
  titan: "Tita",
};

export const workoutDnaArchetypeLabel = (archetype: WorkoutDnaArchetype) => archetypeLabels[archetype];

const styleLabels: Record<WorkoutDnaStyle, string> = {
  balanced: "Equilibrio",
  consistency: "Consistencia",
  hypertrophy: "Volume",
  specialization: "Especializacao",
  strength: "Forca",
};

export const workoutDnaStyleLabel = (style: WorkoutDnaStyle) => styleLabels[style];

const sessionDay = (value: string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const weeksBetween = (first: string, last: string) => {
  const start = sessionDay(first).getTime();
  const end = sessionDay(last).getTime();
  return Math.max(1, Math.ceil((end - start + 1) / (7 * 24 * 60 * 60 * 1000)));
};

const averageWeeklyFrequency = (dates: string[]) => {
  if (!dates.length) return 0;
  const sorted = [...dates].sort((left, right) => new Date(left).getTime() - new Date(right).getTime());
  return dates.length / weeksBetween(sorted[0], sorted.at(-1)!);
};

const distributionBalance = (stats: WorkoutDnaGroupStat[], knownGroupCount: number) => {
  const trained = stats.filter((item) => item.volume > 0 || item.sets > 0);
  const total = trained.reduce((sum, item) => sum + item.volume, 0);
  if (!trained.length || !total || knownGroupCount <= 1) return 0;
  const entropy = -trained.reduce((sum, item) => {
    const share = item.volume / total;
    return sum + share * Math.log(share);
  }, 0);
  const normalizedEntropy = entropy / Math.log(knownGroupCount);
  const coverage = trained.length / knownGroupCount;
  return clampScore(normalizedEntropy * 70 + coverage * 30);
};

const scoreArchetypes = (profile: Pick<WorkoutDnaProfile, "dominantGroups" | "scores"> & { prCount: number; workoutCount: number }) => {
  const topShare = profile.dominantGroups[0]?.volume && profile.dominantGroups.reduce((sum, group) => sum + group.volume, 0)
    ? profile.dominantGroups[0].volume / profile.dominantGroups.reduce((sum, group) => sum + group.volume, 0)
    : 0;
  const scored: Array<[WorkoutDnaArchetype, number]> = [
    ["balanced", profile.scores.balance],
    ["builder", profile.scores.volume + Math.min(20, profile.workoutCount * 2)],
    ["relentless", profile.scores.consistency],
    ["specialist", topShare >= 0.45 ? 82 + topShare * 18 : topShare * 100],
    ["titan", profile.scores.strength + Math.min(15, profile.prCount)],
  ];
  return scored.sort((left, right) => right[1] - left[1]);
};

const dominantStyleFor = (archetype: WorkoutDnaArchetype): WorkoutDnaStyle => {
  if (archetype === "builder") return "hypertrophy";
  if (archetype === "relentless") return "consistency";
  if (archetype === "specialist") return "specialization";
  if (archetype === "titan") return "strength";
  return "balanced";
};

const summaryFor = (archetype: WorkoutDnaArchetype, topGroup?: string) => {
  if (archetype === "builder") return "Seu historico mostra volume consistente e construcao gradual.";
  if (archetype === "titan") return "Seu DNA aponta para forca, carga e busca real por marcas.";
  if (archetype === "relentless") return "Sua assinatura esta na frequencia: voce aparece e repete.";
  if (archetype === "specialist") return `Seu treino concentra energia em ${topGroup ?? "poucos grupos"} e cria uma identidade bem marcada.`;
  return "Seu treino esta distribuido com boa base entre frequencia, volume e variedade.";
};

const buildStrengths = (profile: Pick<WorkoutDnaProfile, "averageWeeklyFrequency" | "dominantGroups" | "prCount" | "scores" | "workoutCount">) => {
  const strengths: string[] = [];
  if (profile.scores.consistency >= 70) strengths.push("Consistencia acima da media");
  if (profile.scores.volume >= 70) strengths.push("Boa capacidade de acumular volume");
  if (profile.scores.strength >= 65) strengths.push("Historico relevante de PRs");
  if (profile.scores.balance >= 70) strengths.push("Distribuicao muscular equilibrada");
  if (profile.dominantGroups[0]) strengths.push(`Base forte em ${profile.dominantGroups[0].group}`);
  if (!strengths.length && profile.workoutCount > 0) strengths.push("Base inicial registrada com clareza");
  return strengths.slice(0, 4);
};

const buildAttentionPoints = (profile: Pick<WorkoutDnaProfile, "averageWeeklyFrequency" | "neglectedGroups" | "scores" | "workoutCount">) => {
  const points: string[] = [];
  if (profile.workoutCount < 3) points.push("Mais treinos vao deixar o DNA mais confiavel");
  if (profile.scores.consistency < 45) points.push("Aumentar frequencia semanal melhora consistencia");
  if (profile.scores.balance < 45 && profile.workoutCount >= 3) points.push("Distribuir melhor os grupos reduz pontos cegos");
  if (profile.neglectedGroups[0]) points.push(`${profile.neglectedGroups[0].group} aparece pouco no historico`);
  if (!points.length) points.push("Manter variedade e progressao sem exagerar em volume");
  return points.slice(0, 4);
};

export const generateWorkoutDna = ({ exercises, personalRecords, sessions, streak = 0 }: WorkoutDnaInput): WorkoutDnaProfile => {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const groupNames = [...new Set(exercises.map((exercise) => exercise.muscleGroup))];
  const groupMap = new Map<string, WorkoutDnaGroupStat>(groupNames.map((group) => [group, { group, sessions: 0, sets: 0, volume: 0 }]));
  const exerciseStats = new Map<string, { exerciseId: string; name: string; group: string; sessions: number; sets: number; volume: number }>();
  let totalSets = 0;
  let totalVolume = 0;

  for (const session of sessions) {
    const groupsInSession = new Set<string>();
    for (const item of session.exercises) {
      const exercise = exerciseById.get(item.exerciseId);
      const group = exercise?.muscleGroup ?? "Outros";
      const name = exercise?.name ?? item.exerciseId;
      const volume = item.sets.reduce((sum, set) => sum + Math.max(0, set.weight) * Math.max(0, set.reps), 0);
      const sets = item.sets.length;
      totalSets += sets;
      totalVolume += volume;
      groupsInSession.add(group);
      const groupStat = groupMap.get(group) ?? { group, sessions: 0, sets: 0, volume: 0 };
      groupStat.sets += sets;
      groupStat.volume += volume;
      groupMap.set(group, groupStat);
      const current = exerciseStats.get(item.exerciseId) ?? { exerciseId: item.exerciseId, name, group, sessions: 0, sets: 0, volume: 0 };
      current.sessions += 1;
      current.sets += sets;
      current.volume += volume;
      exerciseStats.set(item.exerciseId, current);
    }
    for (const group of groupsInSession) {
      const stat = groupMap.get(group);
      if (stat) stat.sessions += 1;
    }
  }

  const allGroups = [...groupMap.values()];
  const trainedGroups = allGroups.filter((group) => group.sets > 0 || group.volume > 0);
  const dominantGroups = [...trainedGroups].sort((left, right) => right.volume - left.volume).slice(0, 3);
  const neglectedGroups = [...allGroups].sort((left, right) => left.volume - right.volume || left.sets - right.sets).slice(0, 3);
  const frequency = averageWeeklyFrequency(sessions.map((session) => session.date));
  const averageVolume = sessions.length ? totalVolume / sessions.length : 0;
  const prCount = personalRecords.length;
  const scores = {
    balance: distributionBalance(allGroups, groupNames.length),
    consistency: clampScore(frequency * 22 + Math.min(28, streak * 2)),
    strength: clampScore(prCount * 8 + Math.min(35, personalRecords.filter((record) => record.type === "absolute_weight" || record.type === "estimated_1rm").length * 5)),
    volume: clampScore(averageVolume / 180),
  };
  const favoriteExercises = [...exerciseStats.values()].sort((left, right) => right.sessions - left.sessions || right.volume - left.volume).slice(0, 4);
  const temporaryProfile = {
    dominantGroups,
    prCount,
    scores,
    workoutCount: sessions.length,
  };
  const ranked = scoreArchetypes(temporaryProfile);
  const archetype = sessions.length === 0 ? "balanced" : ranked[0][0];
  const secondaryArchetype = ranked[1] && ranked[1][1] >= ranked[0][1] - 12 ? ranked[1][0] : undefined;

  const profile: WorkoutDnaProfile = {
    archetype,
    secondaryArchetype: secondaryArchetype === archetype ? undefined : secondaryArchetype,
    averageWeeklyFrequency: Number(frequency.toFixed(1)),
    dominantGroups,
    dominantStyle: dominantStyleFor(archetype),
    favoriteExercises,
    neglectedGroups,
    prCount,
    scores,
    attentionPoints: [],
    strengths: [],
    summary: summaryFor(archetype, dominantGroups[0]?.group),
    totalSets,
    totalVolume,
    workoutCount: sessions.length,
  };
  profile.strengths = buildStrengths(profile);
  profile.attentionPoints = buildAttentionPoints(profile);
  return profile;
};
