import type { WorkoutPlan, WorkoutSession } from "../types";

const now = new Date();
const daysAgo = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const starterPlans: WorkoutPlan[] = [
  {
    id: "plan-upper-push",
    title: "Push controlado",
    description: "Peito, ombro e triceps com progressao de carga.",
    color: "#FF6B57",
    icon: "flame",
    muscleGroups: ["Peito", "Ombro", "Triceps"],
    blocks: [
      {
        id: "block-push-main",
        title: "Forca superior",
        color: "#FF6B57",
        exerciseIds: [
          "peito-1-supino-reto-com-barra",
          "ombro-2-desenvolvimento-com-halteres",
          "triceps-2-triceps-pulley-corda",
        ],
      },
    ],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1),
  },
  {
    id: "plan-lower-build",
    title: "Lower build",
    description: "Quadriceps, posterior e gluteo em blocos densos.",
    color: "#B7F34D",
    icon: "mountain",
    muscleGroups: ["Quadriceps", "Posterior de coxa", "Gluteo"],
    blocks: [
      {
        id: "block-lower-main",
        title: "Membros inferiores",
        color: "#B7F34D",
        exerciseIds: [
          "quadriceps-1-agachamento-livre",
          "posterior-de-coxa-3-romanian-deadlift",
          "gluteo-1-hip-thrust-com-barra",
          "panturrilha-3-panturrilha-no-leg-press",
        ],
      },
    ],
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
  },
];

export const starterSessions: WorkoutSession[] = [
  {
    id: "session-push-a",
    workoutPlanId: "plan-upper-push",
    date: daysAgo(6),
    exercises: [
      {
        id: "logged-bench-a",
        exerciseId: "peito-1-supino-reto-com-barra",
        sets: [
          { id: "bench-a-1", weight: 70, reps: 8, rpe: 8, rest: 120 },
          { id: "bench-a-2", weight: 72.5, reps: 6, rpe: 9, rest: 150, isPersonalRecord: true },
        ],
      },
      {
        id: "logged-shoulder-a",
        exerciseId: "ombro-2-desenvolvimento-com-halteres",
        sets: [{ id: "shoulder-a-1", weight: 24, reps: 10, rpe: 8, rest: 90 }],
      },
    ],
  },
  {
    id: "session-lower-a",
    workoutPlanId: "plan-lower-build",
    date: daysAgo(3),
    exercises: [
      {
        id: "logged-squat-a",
        exerciseId: "quadriceps-1-agachamento-livre",
        sets: [
          { id: "squat-a-1", weight: 95, reps: 6, rpe: 8, rest: 150 },
          { id: "squat-a-2", weight: 100, reps: 5, rpe: 9, rest: 180, isPersonalRecord: true },
        ],
      },
      {
        id: "logged-thrust-a",
        exerciseId: "gluteo-1-hip-thrust-com-barra",
        sets: [{ id: "thrust-a-1", weight: 120, reps: 8, rpe: 8, rest: 120 }],
      },
    ],
  },
];
