import { inviteRepository } from "../repositories/inviteRepository";
import type { User } from "../types";

export const inviteService = {
  listInvites(coachId: string) {
    return inviteRepository.list(coachId);
  },
  createInvite(coachId: string, value: string) {
    return inviteRepository.create(coachId, value);
  },
  acceptInvite(code: string, student: User) {
    return inviteRepository.acceptInvite(code, student);
  },
};
