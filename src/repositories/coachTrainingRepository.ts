import { databaseClient } from "../services/databaseClient";
import type { CoachTrainingContext, CoachWorkoutSyncPayload, StudentDashboard } from "../types";

const readStudents = () => databaseClient.read<StudentDashboard[]>("coach_students", []);
const writeStudents = (students: StudentDashboard[]) => databaseClient.write("coach_students", students);

export const coachTrainingRepository = {
  setActiveContext(context: CoachTrainingContext) {
    databaseClient.write("coach_training_context", context);
    return context;
  },
  getActiveContext() {
    return databaseClient.read<CoachTrainingContext | null>("coach_training_context", null);
  },
  clearActiveContext() {
    databaseClient.write("coach_training_context", null);
  },
  recordCoachSession({ context, plan, session }: CoachWorkoutSyncPayload) {
    const timestamp = new Date().toISOString();
    const totalVolume = session.exercises.reduce(
      (sum, exercise) => sum + exercise.sets.reduce((setSum, set) => setSum + set.weight * set.reps, 0),
      0,
    );
    const bestSet = session.exercises
      .flatMap((exercise) => exercise.sets.map((set) => ({ ...set, exerciseId: exercise.exerciseId })))
      .sort((left, right) => right.weight - left.weight)[0];

    const students = readStudents();
    writeStudents(
      students.map((student) => {
        if (student.relation.coachId !== context.coachId || student.student.id !== context.studentId) return student;
        const nextHistory = [
          {
            id: session.id,
            studentId: context.studentId,
            workoutPlanId: plan.id,
            title: plan.title,
            date: session.date,
            durationMinutes: Math.max(30, session.exercises.length * 8),
            volume: Math.round(totalVolume),
            completedExercises: session.exercises.length,
          },
          ...student.history,
        ];
        const lastProgress = student.progress.at(-1);
        const nextProgress = [
          ...student.progress,
          {
            label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(timestamp)),
            exerciseName: plan.exercises.find((exercise) => exercise.exerciseId === bestSet?.exerciseId)?.name ?? lastProgress?.exerciseName ?? "Treino",
            load: bestSet?.weight ?? lastProgress?.load ?? 0,
            volume: Math.round(totalVolume),
            personalRecord: Math.max(bestSet?.weight ?? 0, lastProgress?.personalRecord ?? 0),
          },
        ].slice(-6);
        const currentWeek = student.frequency.at(-1);
        const nextFrequency = currentWeek
          ? [...student.frequency.slice(0, -1), { ...currentWeek, workouts: currentWeek.workouts + 1 }]
          : student.frequency;
        return {
          ...student,
          student: { ...student.student, lastWorkoutAt: session.date, updatedAt: timestamp },
          history: nextHistory,
          progress: nextProgress,
          frequency: nextFrequency,
          recentFrequency: nextFrequency.at(-1) ? `${nextFrequency.at(-1)!.workouts}/${nextFrequency.at(-1)!.target} treinos` : student.recentFrequency,
          lastWorkoutLabel: "Agora, treino acompanhado",
          progressSummary: totalVolume ? `Volume atualizado: ${Math.round(totalVolume).toLocaleString("pt-BR")} kg` : student.progressSummary,
          relation: { ...student.relation, updatedAt: timestamp },
        };
      }),
    );
  },
};
