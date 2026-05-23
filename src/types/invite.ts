export type InviteStatus = "pending" | "accepted" | "expired" | "canceled";

export type CoachInvite = {
  id: string;
  coachId: string;
  studentEmail?: string;
  studentId?: string;
  inviteCode: string;
  inviteLink: string;
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  canceledAt?: string;
};
