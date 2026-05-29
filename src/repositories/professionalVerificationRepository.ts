import { databaseClient, supabase } from "../services/databaseClient";
import type { ProfessionalVerificationStatus } from "../types";

export type ProfessionalVerification = {
  id: string;
  userId: string;
  fullName: string;
  cpfHash?: string;
  crefNumber?: string;
  crefRegion?: string;
  crefCategory?: string;
  status: ProfessionalVerificationStatus;
  verificationMethod: "automated" | "manual";
  matchedName?: string;
  matchedRegion?: string;
  matchedStatus?: string;
  documentUrl?: string;
  reviewNotes?: string;
  verifiedAt?: string;
  rejectedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

type ProfessionalVerificationRow = {
  id: string;
  user_id: string;
  full_name: string;
  cpf_hash?: string | null;
  cref_number?: string | null;
  cref_region?: string | null;
  cref_category?: string | null;
  status: ProfessionalVerificationStatus;
  verification_method: "automated" | "manual";
  matched_name?: string | null;
  matched_region?: string | null;
  matched_status?: string | null;
  document_url?: string | null;
  review_notes?: string | null;
  verified_at?: string | null;
  rejected_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfessionalVerificationSubmission = {
  userId: string;
  fullName: string;
  cpfHash: string;
  crefNumber: string;
  crefRegion: string;
  crefCategory: string;
  status: ProfessionalVerificationStatus;
  verificationMethod: "automated" | "manual";
  matchedName?: string;
  matchedRegion?: string;
  matchedStatus?: string;
  documentUrl?: string;
};

const rowToVerification = (row: ProfessionalVerificationRow): ProfessionalVerification => ({
  id: row.id,
  userId: row.user_id,
  fullName: row.full_name,
  cpfHash: row.cpf_hash ?? undefined,
  crefNumber: row.cref_number ?? undefined,
  crefRegion: row.cref_region ?? undefined,
  crefCategory: row.cref_category ?? undefined,
  status: row.status,
  verificationMethod: row.verification_method,
  matchedName: row.matched_name ?? undefined,
  matchedRegion: row.matched_region ?? undefined,
  matchedStatus: row.matched_status ?? undefined,
  documentUrl: row.document_url ?? undefined,
  reviewNotes: row.review_notes ?? undefined,
  verifiedAt: row.verified_at ?? undefined,
  rejectedAt: row.rejected_at ?? undefined,
  expiresAt: row.expires_at ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const localVerifications = () => databaseClient.read<ProfessionalVerification[]>("professional_verifications", []);
const saveLocalVerifications = (items: ProfessionalVerification[]) => databaseClient.write("professional_verifications", items);

export const professionalVerificationRepository = {
  async startSignup(input: { fullName: string; userId: string }) {
    if (supabase) {
      const { data, error } = await supabase.rpc("start_professional_verification_signup", {
        p_full_name: input.fullName,
      });
      if (error || !data) return undefined;
      return rowToVerification(data as ProfessionalVerificationRow);
    }

    const now = new Date().toISOString();
    const open = await this.getLatest(input.userId);
    if (open && (open.status === "pending" || open.status === "manual_review")) return open;
    const verification: ProfessionalVerification = {
      fullName: input.fullName,
      id: `prof-verification-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      status: "pending",
      userId: input.userId,
      verificationMethod: "manual",
      createdAt: now,
      updatedAt: now,
    };
    saveLocalVerifications([verification, ...localVerifications()]);
    return verification;
  },
  async getLatest(userId: string) {
    if (supabase) {
      const { data, error } = await supabase
        .from("professional_verifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return error || !data ? undefined : rowToVerification(data as ProfessionalVerificationRow);
    }
    return localVerifications()
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  },
  async submit(input: ProfessionalVerificationSubmission) {
    if (supabase) {
      const { data, error } = await supabase.rpc("submit_professional_verification", {
        p_cpf_hash: input.cpfHash,
        p_cref_category: input.crefCategory,
        p_cref_number: input.crefNumber,
        p_cref_region: input.crefRegion,
        p_document_url: input.documentUrl ?? null,
        p_full_name: input.fullName,
        p_matched_name: input.matchedName ?? null,
        p_matched_region: input.matchedRegion ?? null,
        p_matched_status: input.matchedStatus ?? null,
        p_status: input.status,
        p_verification_method: input.verificationMethod,
      });
      if (error || !data) return undefined;
      return rowToVerification(data as ProfessionalVerificationRow);
    }

    const now = new Date().toISOString();
    const verification: ProfessionalVerification = {
      ...input,
      id: `prof-verification-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    saveLocalVerifications([verification, ...localVerifications()]);
    return verification;
  },
  async uploadDocument(userId: string, file: File) {
    if (!supabase) return undefined;
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/cref-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("professional-documents").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) return undefined;
    return path;
  },
};
