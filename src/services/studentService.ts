import { studentRepository } from "../repositories/studentRepository";

export const studentService = {
  listStudents(coachId: string) {
    return studentRepository.listForCoach(coachId);
  },
  getStudent(coachId: string, studentId: string) {
    return studentRepository.getForCoach(coachId, studentId);
  },
};
