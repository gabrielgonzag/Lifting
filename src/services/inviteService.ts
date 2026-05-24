import { inviteRepository } from "../repositories/inviteRepository";
import type { User } from "../types";
import { permissionService } from "./permissionService";
import { planService } from "./planService";

export const inviteService = {
  listInvites(coachId: string) {
    return inviteRepository.list(coachId);
  },
  createInvite(coachId: string, value: string, context?: { user?: User; activeStudentCount: number }) {
    if (context) {
      if (!permissionService.canInviteStudents(context.user)) return undefined;
      if (!planService.canInviteMoreStudents(context.user, context.activeStudentCount)) return undefined;
    }
    return inviteRepository.create(coachId, value);
  },
  acceptInvite(code: string, student: User) {
    return inviteRepository.acceptInvite(code, student);
  },
};
