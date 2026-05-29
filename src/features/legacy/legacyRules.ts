import { legacyTitles } from "../gamification/titles";
import type { LegacyEvent, LegacyInput, LegacySummary } from "./legacyTypes";
import type { WorkoutSession } from "../../types";

const titleName = (id: string) => legacyTitles.find((title) => title.id === id)?.name ?? id;

const sortByDate = <T extends { date: string }>(items: T[]) =>
  [...items].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

const eventPriority: Record<LegacyEvent["impact"], number> = {
  high: 2,
  medium: 1,
  mythic: 3,
};

const addUnique = (events: LegacyEvent[], event?: LegacyEvent) => {
  if (!event || events.some((item) => item.id === event.id)) return;
  events.push(event);
};

const nthSessionEvent = (sessions: WorkoutSession[], count: number): LegacyEvent | undefined => {
  const session = sessions[count - 1];
  if (!session) return undefined;
  const labels: Record<number, string> = {
    1: "Primeiro treino registrado",
    10: "Decimo treino",
    50: "Quinquagesimo treino",
    100: "Centesimo treino",
  };
  return {
    description: count === 1 ? "A historia no LIFTO comecou aqui." : `${count} treinos registrados na jornada.`,
    id: `workout-${count}`,
    impact: count >= 100 ? "mythic" : count >= 50 ? "high" : "medium",
    metadata: { workouts: count },
    occurredAt: session.date,
    title: labels[count] ?? `${count} treinos`,
    type: count === 1 ? "first_workout" : "workout_milestone",
  };
};

const firstPrEvent = (input: LegacyInput): LegacyEvent | undefined => {
  const record = sortByDate(input.personalRecords)[0];
  if (!record) return undefined;
  return {
    description: `${record.exerciseName} entrou para os recordes pessoais.`,
    id: "first-pr",
    impact: "medium",
    metadata: { exercise: record.exerciseName, value: Math.round(record.value) },
    occurredAt: record.date,
    title: "Primeiro PR",
    type: "first_pr",
  };
};

const legendaryPrEvent = (input: LegacyInput): LegacyEvent | undefined => {
  const ranked = [...input.personalRecords]
    .filter((record) => record.type === "absolute_weight" || record.type === "estimated_1rm" || record.type === "set_volume")
    .sort((left, right) => right.value - left.value);
  const record = ranked[0];
  if (!record) return undefined;
  const isLegendary = record.type === "set_volume" ? record.value >= 2_500 : record.value >= 100;
  if (!isLegendary) return undefined;
  return {
    description: `${record.exerciseName} marcou uma referencia pesada no historico.`,
    id: `legendary-pr-${record.exerciseId}-${record.type}`,
    impact: "high",
    metadata: { exercise: record.exerciseName, value: Math.round(record.value) },
    occurredAt: record.date,
    title: "PR de impacto",
    type: "legendary_pr",
  };
};

const streakEvents = (input: LegacyInput, fallbackDate: string) =>
  [7, 30]
    .filter((days) => input.progression.streak >= days)
    .map<LegacyEvent>((days) => ({
      description: `${days} dias de sequencia consolidaram disciplina real.`,
      id: `streak-${days}`,
      impact: days >= 30 ? "high" : "medium",
      metadata: { days },
      occurredAt: fallbackDate,
      title: `${days} dias seguidos`,
      type: "streak_milestone",
    }));

const volumeEvents = (input: LegacyInput, fallbackDate: string) =>
  [25_000, 75_000, 250_000, 1_000_000]
    .filter((volume) => input.progression.totalVolume >= volume)
    .map<LegacyEvent>((volume) => ({
      description: `${Math.round(volume / 1000)}k kg de volume acumulado no historico.`,
      id: `volume-${volume}`,
      impact: volume >= 1_000_000 ? "mythic" : volume >= 250_000 ? "high" : "medium",
      metadata: { volume },
      occurredAt: fallbackDate,
      title: "Volume historico",
      type: "volume_milestone",
    }));

const titleEvents = (input: LegacyInput, fallbackDate: string) =>
  input.progression.titleIds
    .filter((id) => id !== "iniciante")
    .map<LegacyEvent>((id) => ({
      description: `${titleName(id)} passou a fazer parte do seu legado.`,
      id: `title-${id}`,
      impact: id === "mr-olympia" ? "mythic" : "high",
      metadata: { title: titleName(id) },
      occurredAt: fallbackDate,
      title: "Titulo conquistado",
      type: "title_unlocked",
    }));

export const generateLegacySummary = (input: LegacyInput): LegacySummary => {
  const events: LegacyEvent[] = [];
  const sessions = sortByDate(input.sessions);
  const fallbackDate = sessions.at(-1)?.date ?? new Date().toISOString();

  for (const count of [1, 10, 50, 100]) addUnique(events, nthSessionEvent(sessions, count));
  addUnique(events, firstPrEvent(input));
  addUnique(events, legendaryPrEvent(input));
  for (const event of streakEvents(input, fallbackDate)) addUnique(events, event);
  for (const event of volumeEvents(input, fallbackDate)) addUnique(events, event);
  for (const event of titleEvents(input, fallbackDate)) addUnique(events, event);

  const sorted = events.sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());
  const featuredEvent = [...sorted].sort((left, right) => eventPriority[right.impact] - eventPriority[left.impact] || new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())[0];

  return {
    currentTitle: titleName(input.progression.currentTitleId),
    events: sorted,
    featuredEvent,
    timelineLabel: sorted.length ? `${sorted.length} marcos registrados` : "Aguardando o primeiro marco",
    totalMilestones: sorted.length,
  };
};
