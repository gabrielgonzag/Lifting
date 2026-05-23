import type { CoachInvite, CoachNote, CoachStudentRelation, SharedWorkoutPlan, StudentDashboard } from "../types";

const now = new Date("2026-05-22T18:00:00.000Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

const frequency = [
  { label: "Sem 1", workouts: 3, target: 4 },
  { label: "Sem 2", workouts: 4, target: 4 },
  { label: "Sem 3", workouts: 2, target: 4 },
  { label: "Sem 4", workouts: 4, target: 4 },
];

const progress = (exerciseName: string, base: number) => [
  { label: "Jan", exerciseName, load: base, volume: base * 32, personalRecord: base + 6 },
  { label: "Fev", exerciseName, load: base + 4, volume: (base + 4) * 34, personalRecord: base + 10 },
  { label: "Mar", exerciseName, load: base + 7, volume: (base + 7) * 36, personalRecord: base + 13 },
  { label: "Abr", exerciseName, load: base + 10, volume: (base + 10) * 38, personalRecord: base + 17 },
];

export const coachMockRelations = (coachId: string): CoachStudentRelation[] => [
  { id: "rel-lara", coachId, studentId: "student-lara", status: "active", createdAt: daysAgo(80), acceptedAt: daysAgo(79), updatedAt: daysAgo(2) },
  { id: "rel-mateus", coachId, studentId: "student-mateus", status: "active", createdAt: daysAgo(64), acceptedAt: daysAgo(64), updatedAt: daysAgo(1) },
  { id: "rel-nina", coachId, studentId: "student-nina", status: "active", createdAt: daysAgo(30), acceptedAt: daysAgo(29), updatedAt: daysAgo(5) },
];

export const coachMockStudents = (coachId: string): StudentDashboard[] => {
  const relations = coachMockRelations(coachId);
  return [
    {
      relation: relations[0],
      student: {
        id: "student-lara",
        name: "Lara Nogueira",
        email: "lara.nogueira@email.com",
        role: "casual",
        plan: "basic",
        avatarUrl: undefined,
        goal: "Hipertrofia com foco em superiores",
        frequencyGoal: 4,
        lastWorkoutAt: daysAgo(1),
        createdAt: daysAgo(120),
        updatedAt: daysAgo(1),
      },
      recentFrequency: "4/4 treinos",
      lastWorkoutLabel: "Ontem, Upper Push",
      progressSummary: "+12 kg no supino em 8 semanas",
      frequency,
      progress: progress("Supino reto", 42),
      history: [
        { id: "hist-lara-1", studentId: "student-lara", workoutPlanId: "shared-lara-a", title: "Upper Push", date: daysAgo(1), durationMinutes: 54, volume: 6940, completedExercises: 6 },
        { id: "hist-lara-2", studentId: "student-lara", workoutPlanId: "shared-lara-b", title: "Lower Base", date: daysAgo(3), durationMinutes: 49, volume: 8120, completedExercises: 5 },
        { id: "hist-lara-3", studentId: "student-lara", workoutPlanId: "shared-lara-a", title: "Upper Push", date: daysAgo(6), durationMinutes: 58, volume: 6720, completedExercises: 6 },
      ],
    },
    {
      relation: relations[1],
      student: {
        id: "student-mateus",
        name: "Mateus Lima",
        email: "mateus.lima@email.com",
        role: "casual",
        plan: "free",
        goal: "Forca e recomposicao corporal",
        frequencyGoal: 3,
        lastWorkoutAt: daysAgo(2),
        createdAt: daysAgo(90),
        updatedAt: daysAgo(2),
      },
      recentFrequency: "3/3 treinos",
      lastWorkoutLabel: "Ha 2 dias, Full Body",
      progressSummary: "+18% de volume mensal",
      frequency: frequency.map((item) => ({ ...item, target: 3, workouts: Math.min(item.workouts, 3) })),
      progress: progress("Agachamento livre", 70),
      history: [
        { id: "hist-mateus-1", studentId: "student-mateus", workoutPlanId: "shared-mateus-a", title: "Full Body A", date: daysAgo(2), durationMinutes: 62, volume: 10220, completedExercises: 7 },
        { id: "hist-mateus-2", studentId: "student-mateus", workoutPlanId: "shared-mateus-a", title: "Full Body A", date: daysAgo(5), durationMinutes: 59, volume: 9880, completedExercises: 7 },
      ],
    },
    {
      relation: relations[2],
      student: {
        id: "student-nina",
        name: "Nina Castro",
        email: "nina.castro@email.com",
        role: "casual",
        plan: "basic",
        goal: "Voltar a treinar com constancia",
        frequencyGoal: 3,
        lastWorkoutAt: daysAgo(5),
        createdAt: daysAgo(45),
        updatedAt: daysAgo(5),
      },
      recentFrequency: "2/3 treinos",
      lastWorkoutLabel: "Ha 5 dias, Base Tecnica",
      progressSummary: "Semana consistente retomada",
      frequency: [
        { label: "Sem 1", workouts: 1, target: 3 },
        { label: "Sem 2", workouts: 2, target: 3 },
        { label: "Sem 3", workouts: 2, target: 3 },
        { label: "Sem 4", workouts: 3, target: 3 },
      ],
      progress: progress("Levantamento terra", 50),
      history: [
        { id: "hist-nina-1", studentId: "student-nina", workoutPlanId: "shared-nina-a", title: "Base Tecnica", date: daysAgo(5), durationMinutes: 43, volume: 5120, completedExercises: 5 },
        { id: "hist-nina-2", studentId: "student-nina", workoutPlanId: "shared-nina-a", title: "Base Tecnica", date: daysAgo(9), durationMinutes: 39, volume: 4760, completedExercises: 5 },
      ],
    },
  ];
};

export const coachMockWorkouts = (coachId: string): SharedWorkoutPlan[] => [
  {
    id: "shared-lara-a",
    coachId,
    studentId: "student-lara",
    workoutPlanId: "plan-lara-a",
    title: "Upper Push",
    description: "Progressao de empurrar com foco em supino e estabilidade escapular.",
    notes: "Manter tecnica limpa antes de subir carga.",
    createdAt: daysAgo(70),
    updatedAt: daysAgo(1),
    lastEditedBy: coachId,
    exercises: [
      { id: "ex-lara-1", exerciseId: "supino-reto", name: "Supino reto", order: 1, sets: 4, reps: "6-8", suggestedLoad: 58, restSeconds: 150, notes: "Pausar 1s no peito." },
      { id: "ex-lara-2", exerciseId: "desenvolvimento", name: "Desenvolvimento halteres", order: 2, sets: 3, reps: "8-10", suggestedLoad: 18, restSeconds: 120 },
      { id: "ex-lara-3", exerciseId: "triceps-corda", name: "Triceps corda", order: 3, sets: 3, reps: "12-15", suggestedLoad: 22, restSeconds: 75 },
    ],
  },
  {
    id: "shared-lara-b",
    coachId,
    studentId: "student-lara",
    workoutPlanId: "plan-lara-b",
    title: "Lower Base",
    description: "Base de inferiores com volume moderado.",
    createdAt: daysAgo(68),
    updatedAt: daysAgo(3),
    lastEditedBy: coachId,
    exercises: [
      { id: "ex-lara-4", exerciseId: "agachamento", name: "Agachamento livre", order: 1, sets: 4, reps: "5-7", suggestedLoad: 72, restSeconds: 180 },
      { id: "ex-lara-5", exerciseId: "leg-press", name: "Leg press", order: 2, sets: 3, reps: "10-12", suggestedLoad: 150, restSeconds: 120 },
    ],
  },
  {
    id: "shared-mateus-a",
    coachId,
    studentId: "student-mateus",
    workoutPlanId: "plan-mateus-a",
    title: "Full Body A",
    description: "Sessao densa para forca geral.",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(2),
    lastEditedBy: coachId,
    exercises: [
      { id: "ex-mateus-1", exerciseId: "terra", name: "Levantamento terra", order: 1, sets: 5, reps: "3-5", suggestedLoad: 112, restSeconds: 210 },
      { id: "ex-mateus-2", exerciseId: "remada", name: "Remada curvada", order: 2, sets: 4, reps: "6-8", suggestedLoad: 62, restSeconds: 150 },
    ],
  },
  {
    id: "shared-nina-a",
    coachId,
    studentId: "student-nina",
    workoutPlanId: "plan-nina-a",
    title: "Base Tecnica",
    description: "Retorno ao treino com controle de carga e baixa friccao.",
    createdAt: daysAgo(28),
    updatedAt: daysAgo(5),
    lastEditedBy: coachId,
    exercises: [
      { id: "ex-nina-1", exerciseId: "goblet", name: "Agachamento goblet", order: 1, sets: 3, reps: "10", suggestedLoad: 18, restSeconds: 90 },
      { id: "ex-nina-2", exerciseId: "puxada", name: "Puxada frente", order: 2, sets: 3, reps: "10-12", suggestedLoad: 32, restSeconds: 90 },
    ],
  },
];

export const coachMockNotes = (coachId: string): CoachNote[] => [
  { id: "note-1", coachId, studentId: "student-lara", workoutPlanId: "shared-lara-a", exerciseId: "ex-lara-1", type: "progression", content: "Aluno evoluiu bem no supino, manter progressao.", createdAt: daysAgo(2), updatedAt: daysAgo(2) },
  { id: "note-2", coachId, studentId: "student-mateus", workoutPlanId: "shared-mateus-a", type: "workout", content: "Aumentar descanso nos exercicios compostos.", createdAt: daysAgo(4), updatedAt: daysAgo(4) },
  { id: "note-3", coachId, studentId: "student-nina", type: "general", content: "Reduzir carga no agachamento por desconforto no joelho.", createdAt: daysAgo(6), updatedAt: daysAgo(6) },
];

export const coachMockInvites = (coachId: string): CoachInvite[] => [
  {
    id: "invite-ana",
    coachId,
    studentEmail: "ana.futura@email.com",
    inviteCode: "LFT-ANA24",
    inviteLink: "https://lifting-production.up.railway.app/#register?invite=LFT-ANA24",
    status: "pending",
    createdAt: daysAgo(1),
    expiresAt: daysAgo(-13),
  },
];
