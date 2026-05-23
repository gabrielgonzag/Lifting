import { inviteService } from "./inviteService";
import { sharedWorkoutService } from "./sharedWorkoutService";
import { studentService } from "./studentService";
import type { CoachWorkspace } from "../types";

export const coachService = {
  loadWorkspace(coachId: string): CoachWorkspace {
    const students = studentService.listStudents(coachId);
    return {
      students,
      invites: inviteService.listInvites(coachId),
      sharedWorkouts: students.flatMap((item) => sharedWorkoutService.listStudentWorkouts(coachId, item.student.id)),
      notes: students.flatMap((item) => sharedWorkoutService.listNotes(coachId, item.student.id)),
    };
  },
};
