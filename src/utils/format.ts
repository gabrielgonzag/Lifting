import type { WorkoutSession } from "../types";

export const formatDay = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));

export const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  }).format(new Date(value));

export const sessionVolume = (session: WorkoutSession) =>
  session.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.reduce((exerciseTotal, set) => exerciseTotal + set.weight * set.reps, 0),
    0,
  );

export const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day + 1);
  return copy;
};

export const inCurrentWeek = (value: string) => new Date(value) >= startOfWeek(new Date());
