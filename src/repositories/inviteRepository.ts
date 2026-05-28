import { coachMockInvites } from "../data/coachMockData";
import { databaseClient } from "../services/databaseClient";
import type { CoachInvite, StudentDashboard, User } from "../types";
import { makeId } from "../utils/id";

const readInvites = () => databaseClient.read<CoachInvite[]>("coach_invites", []);
const writeInvites = (items: CoachInvite[]) => databaseClient.write("coach_invites", items);
const readStudents = () => databaseClient.read<StudentDashboard[]>("coach_students", []);
const writeStudents = (students: StudentDashboard[]) => databaseClient.write("coach_students", students);

const inviteLink = (code: string) => {
  const origin = typeof window === "undefined" ? "https://lifting.up.railway.app" : window.location.origin;
  return `${origin}/#register?invite=${code}`;
};

const seedInvites = (coachId: string) => {
  const seeded = coachMockInvites(coachId);
  writeInvites(seeded);
  return seeded;
};

export const inviteRepository = {
  list(coachId: string) {
    const invites = readInvites().filter((item) => item.coachId === coachId);
    return invites.length ? invites : seedInvites(coachId);
  },
  create(coachId: string, value: string) {
    const timestamp = new Date().toISOString();
    const code = `LFT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const invite: CoachInvite = {
      id: makeId("invite"),
      coachId,
      studentEmail: value.includes("@") ? value : undefined,
      studentId: value.includes("@") ? undefined : value,
      inviteCode: code,
      inviteLink: inviteLink(code),
      status: "pending",
      createdAt: timestamp,
      expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    };
    writeInvites([invite, ...readInvites()]);
    return invite;
  },
  update(invite: CoachInvite) {
    writeInvites(readInvites().map((item) => (item.id === invite.id ? invite : item)));
    return invite;
  },
  findByCode(code: string) {
    return readInvites().find((item) => item.inviteCode === code);
  },
  acceptInvite(code: string, student: User) {
    const invite = this.findByCode(code);
    if (!invite || invite.status !== "pending") return undefined;
    const timestamp = new Date().toISOString();
    const accepted = this.update({ ...invite, studentId: student.id, status: "accepted", acceptedAt: timestamp });
    const students = readStudents();
    const exists = students.some((item) => item.relation.coachId === invite.coachId && item.student.id === student.id);
    if (!exists) {
      writeStudents([
        {
          student: { ...student, goal: "Novo aluno convidado", frequencyGoal: 3, lastWorkoutAt: undefined },
          relation: {
            id: makeId("rel"),
            coachId: invite.coachId,
            studentId: student.id,
            status: "active",
            createdAt: invite.createdAt,
            acceptedAt: timestamp,
            updatedAt: timestamp,
          },
          recentFrequency: "Sem treinos recentes",
          lastWorkoutLabel: "Aguardando primeiro treino",
          progressSummary: "Ficha inicial pronta para configuracao",
          frequency: [
            { label: "Sem 1", workouts: 0, target: 3 },
            { label: "Sem 2", workouts: 0, target: 3 },
            { label: "Sem 3", workouts: 0, target: 3 },
            { label: "Sem 4", workouts: 0, target: 3 },
          ],
          progress: [
            { label: "Inicio", exerciseName: "Primeiro exercicio", load: 0, volume: 0, personalRecord: 0 },
          ],
          history: [],
        },
        ...students,
      ]);
    }
    return accepted;
  },
};
