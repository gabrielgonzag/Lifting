import { exercises } from "../data/exercises";
import type { PersonalRecord, PersonalRecordType, WorkoutSession, WorkoutSet } from "../types";
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

const manualPrType = (set: WorkoutSet): PersonalRecordType => {
  if (set.prType === "reps") return "max_reps";
  if (set.prType === "volume") return "set_volume";
  return "absolute_weight";
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

export const buildRecordsFromSessions = (sessions: WorkoutSession[]) => {
  const records: PersonalRecord[] = [];
  [...sessions]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .forEach((session) => {
      session.exercises.forEach((entry) => {
        const exercise = exercises.find((item) => item.id === entry.exerciseId);
        if (!exercise) return;
        entry.sets
          .filter(isCompletedSet)
          .forEach((set) => {
            (["absolute_weight", "estimated_1rm", "set_volume", "max_reps"] as PersonalRecordType[]).forEach((type) => {
              const value = setMetricValue(type, set);
              const previous = bestRecord(records, entry.exerciseId, type);
              if (value <= (previous?.value ?? 0)) return;
              records.push(buildRecord(session, entry.exerciseId, exercise.name, set, type));
            });
            if (set.isPr) {
              const type = manualPrType(set);
              const alreadyTracked = records.some(
                (record) =>
                  record.exerciseId === entry.exerciseId &&
                  record.type === type &&
                  record.weight === set.weight &&
                  record.reps === set.reps &&
                  record.date === session.date,
              );
              if (!alreadyTracked) records.push(buildRecord(session, entry.exerciseId, exercise.name, set, type));
            }
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
      .filter(isCompletedSet)
      .forEach((set) => {
        (["absolute_weight", "estimated_1rm", "set_volume", "max_reps"] as PersonalRecordType[]).forEach((type) => {
          const prior = bestRecord([...previousRecords, ...nextRecords], entry.exerciseId, type);
          const value = setMetricValue(type, set);
          if (value <= (prior?.value ?? 0)) return;
          nextRecords.push(buildRecord(session, entry.exerciseId, exercise.name, set, type));
        });
        if (set.isPr) {
          const type = manualPrType(set);
          const alreadyTracked = nextRecords.some(
            (record) =>
              record.exerciseId === entry.exerciseId &&
              record.type === type &&
              record.weight === set.weight &&
              record.reps === set.reps &&
              record.date === session.date,
          );
          if (!alreadyTracked) nextRecords.push(buildRecord(session, entry.exerciseId, exercise.name, set, type));
        }
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
