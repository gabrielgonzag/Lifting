import { exercises } from "../data/exercises";
import type { PersonalRecord, PersonalRecordType, WorkoutSession, WorkoutSet } from "../types";
import type { PrRank } from "../features/gamification/xpSystem";
import { makeId } from "./id";

export const estimatedOneRepMax = (weight: number, reps: number) =>
  weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0;

const setMetricValue = (type: PersonalRecordType, set: WorkoutSet) => {
  if (type === "absolute_weight") return set.weight;
  if (type === "estimated_1rm") return estimatedOneRepMax(set.weight, set.reps);
  if (type === "max_reps") return set.reps;
  return set.weight * set.reps;
};

const isCompletedSet = (set: WorkoutSet) =>
  set.completed === true && set.weight > 0 && set.reps > 0;

const isCompoundExercise = (exerciseId: string) => {
  const exercise = exercises.find((item) => item.id === exerciseId);
  if (!exercise) return true;
  const name = exercise.name.toLowerCase();
  return ["agachamento", "levantamento", "remada", "supino", "terra"].some((term) => name.includes(term));
};

const minWeightProgression = (exerciseId: string) => (isCompoundExercise(exerciseId) ? 2 : 1);

const saneSet = (set: WorkoutSet) =>
  isCompletedSet(set) && Number.isFinite(set.weight) && Number.isFinite(set.reps) && set.weight <= 500 && set.reps <= 100 && set.weight * set.reps <= 50_000;

export const recordLabel = (type: PersonalRecordType) => {
  if (type === "absolute_weight") return "Carga";
  if (type === "estimated_1rm") return "1RM";
  if (type === "max_reps") return "Reps";
  return "Volume";
};

export const recordValueLabel = (record: Pick<PersonalRecord, "type" | "value">) => {
  const value = Math.round(record.value * 10) / 10;
  if (record.type === "max_reps") return `${value} reps`;
  return `${value} kg`;
};

const buildRecord = (
  session: WorkoutSession,
  exerciseId: string,
  exerciseName: string,
  set: WorkoutSet,
  type: PersonalRecordType,
): PersonalRecord => ({
  id: makeId("pr"),
  userId: session.userId,
  exerciseId,
  exerciseName,
  type,
  value: setMetricValue(type, set),
  weight: set.weight,
  reps: set.reps,
  date: session.date,
  createdAt: session.date,
  updatedAt: session.updatedAt ?? session.date,
});

export const classifyPersonalRecord = (value: number, previousValue = 0): PrRank => {
  if (previousValue <= 0) return "bronze";
  const improvement = (value - previousValue) / previousValue;
  if (improvement >= 0.2) return "legendary";
  if (improvement >= 0.1) return "gold";
  if (improvement >= 0.04) return "silver";
  return "bronze";
};

const isMeaningfulRecord = (
  type: PersonalRecordType,
  set: WorkoutSet,
  exerciseId: string,
  previous?: PersonalRecord,
) => {
  if (!saneSet(set)) return false;
  if (!previous) return true;
  const value = setMetricValue(type, set);
  if (value <= previous.value) return false;
  if (type === "absolute_weight") return value - previous.value >= minWeightProgression(exerciseId);
  if (type === "max_reps") return set.reps > previous.reps && set.weight >= previous.weight * 0.95;
  if (type === "set_volume") return value >= previous.value * 1.03;
  return value >= previous.value * 1.01;
};

export const buildRecordsFromSessions = (sessions: WorkoutSession[]) => {
  const records: PersonalRecord[] = [];
  [...sessions]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .forEach((session) => {
      session.exercises.forEach((entry) => {
        const exercise = exercises.find((item) => item.id === entry.exerciseId);
        if (!exercise) return;
        entry.sets
          .filter(saneSet)
          .forEach((set) => {
            (["absolute_weight", "estimated_1rm", "set_volume", "max_reps"] as PersonalRecordType[]).forEach((type) => {
              const previous = bestRecord(records, entry.exerciseId, type);
              if (!isMeaningfulRecord(type, set, entry.exerciseId, previous)) return;
              records.push(buildRecord(session, entry.exerciseId, exercise.name, set, type));
            });
          });
      });
    });
  return records;
};

export const recordsForSession = (
  session: WorkoutSession,
  previousRecords: PersonalRecord[],
) => {
  const nextRecords: PersonalRecord[] = [];
  session.exercises.forEach((entry) => {
    const exercise = exercises.find((item) => item.id === entry.exerciseId);
    if (!exercise) return;
    entry.sets
      .filter(saneSet)
      .forEach((set) => {
        (["absolute_weight", "estimated_1rm", "set_volume", "max_reps"] as PersonalRecordType[]).forEach((type) => {
          const prior = bestRecord([...previousRecords, ...nextRecords], entry.exerciseId, type);
          if (!isMeaningfulRecord(type, set, entry.exerciseId, prior)) return;
          nextRecords.push(buildRecord(session, entry.exerciseId, exercise.name, set, type));
        });
      });
  });
  return nextRecords;
};

export const bestRecord = (
  records: PersonalRecord[],
  exerciseId: string,
  type: PersonalRecordType,
) =>
  records
    .filter((record) => record.exerciseId === exerciseId && record.type === type)
    .sort((left, right) => right.value - left.value)[0];
