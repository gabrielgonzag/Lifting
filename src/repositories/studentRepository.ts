import { coachRepository } from "./coachRepository";

export const studentRepository = {
  listForCoach(coachId: string) {
    return coachRepository.listStudents(coachId);
  },
  getForCoach(coachId: string, studentId: string) {
    return coachRepository.getStudent(coachId, studentId);
  },
};
