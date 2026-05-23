import { coachMockStudents } from "../data/coachMockData";
import { databaseClient } from "../services/databaseClient";
import type { CoachStudentRelation, StudentDashboard } from "../types";

const readStudents = () => databaseClient.read<StudentDashboard[]>("coach_students", []);
const writeStudents = (students: StudentDashboard[]) => databaseClient.write("coach_students", students);

const seedStudents = (coachId: string) => {
  const seeded = coachMockStudents(coachId);
  writeStudents(seeded);
  return seeded;
};

export const coachRepository = {
  listStudents(coachId: string) {
    const students = readStudents().filter((item) => item.relation.coachId === coachId);
    return students.length ? students : seedStudents(coachId);
  },
  getStudent(coachId: string, studentId: string) {
    return this.listStudents(coachId).find((item) => item.student.id === studentId);
  },
  upsertRelation(relation: CoachStudentRelation) {
    const students = readStudents();
    const index = students.findIndex((item) => item.relation.id === relation.id);
    if (index >= 0) {
      students[index] = { ...students[index], relation };
      writeStudents(students);
    }
  },
};
