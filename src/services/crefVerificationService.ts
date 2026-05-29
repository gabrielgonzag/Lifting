import { professionalVerificationRepository } from "../repositories/professionalVerificationRepository";
import { userRepository } from "../repositories/userRepository";
import { auditService } from "./auditService";
import { supabase } from "./databaseClient";
import type { ProfessionalVerificationStatus, User } from "../types";

export type ProfessionalVerificationInput = {
  fullName: string;
  cpf: string;
  crefNumber: string;
  crefRegion: string;
  crefCategory: string;
  document?: File;
  acceptedTerms: boolean;
  publicConsultationAuthorized: boolean;
};

export type CrefVerificationProviderResult = {
  confidenceScore: number;
  matchedName?: string;
  matchedRegion?: string;
  matchedStatus?: string;
  status: ProfessionalVerificationStatus;
};

export type CrefVerificationProvider = {
  calculateMatchScore(input: ProfessionalVerificationInput, response?: Record<string, unknown>): number;
  normalizeCrefNumber(value: string): string;
  sanitizeResponse(response?: Record<string, unknown>): Record<string, string>;
  verifyProfessional(input: ProfessionalVerificationInput): Promise<CrefVerificationProviderResult>;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

const cpfDigits = (value: string) => value.replace(/\D/g, "");

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const hashCpf = async (cpf: string) => {
  const digits = cpfDigits(cpf);
  if (globalThis.crypto?.subtle) {
    const encoded = new TextEncoder().encode(digits);
    return toHex(await globalThis.crypto.subtle.digest("SHA-256", encoded));
  }
  return `local-${digits.slice(0, 3)}-${digits.slice(-2)}`;
};

export const crefVerificationProvider: CrefVerificationProvider = {
  calculateMatchScore(input, response) {
    const matchedName = typeof response?.name === "string" ? response.name : "";
    const matchedRegion = typeof response?.region === "string" ? response.region : "";
    let score = 0;
    if (matchedName && normalizeText(matchedName) === normalizeText(input.fullName)) score += 60;
    if (matchedRegion && normalizeText(matchedRegion) === normalizeText(input.crefRegion)) score += 25;
    if (this.normalizeCrefNumber(input.crefNumber).length >= 4) score += 15;
    return score;
  },
  normalizeCrefNumber(value) {
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  },
  sanitizeResponse(response) {
    return Object.fromEntries(
      Object.entries(response ?? {}).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : String(value).slice(0, 120)]),
    );
  },
  async verifyProfessional(input) {
    const normalizedCref = this.normalizeCrefNumber(input.crefNumber);
    const confidenceScore = normalizedCref.length >= 4 && input.publicConsultationAuthorized ? 35 : 0;
    return {
      confidenceScore,
      status: "manual_review",
    };
  },
};

const allowedDocumentTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export const crefVerificationService = {
  async submit(user: User, input: ProfessionalVerificationInput, provider: CrefVerificationProvider = crefVerificationProvider) {
    const errors: Record<string, string> = {};
    const fullName = input.fullName.trim();
    const crefNumber = provider.normalizeCrefNumber(input.crefNumber);
    const crefRegion = normalizeText(input.crefRegion);
    const cpf = cpfDigits(input.cpf);

    if (fullName.length < 5) errors.fullName = "Informe seu nome completo.";
    if (cpf.length !== 11) errors.cpf = "Informe um CPF valido.";
    if (crefNumber.length < 4) errors.crefNumber = "Informe um CREF valido.";
    if (crefRegion.length < 2) errors.crefRegion = "Informe a regiao do CREF.";
    if (!input.crefCategory.trim()) errors.crefCategory = "Selecione a categoria profissional.";
    if (!input.acceptedTerms) errors.acceptedTerms = "Aceite os termos para continuar.";
    if (!input.publicConsultationAuthorized) errors.publicConsultationAuthorized = "Autorize a consulta publica para validar sua credencial.";
    if (input.document && (!allowedDocumentTypes.has(input.document.type) || input.document.size > 5 * 1024 * 1024)) {
      errors.document = "Envie PDF, JPG, PNG ou WEBP com ate 5MB.";
    }

    if (Object.keys(errors).length) return { errors, ok: false as const };

    const providerResult = await provider.verifyProfessional({ ...input, crefNumber });
    const status = providerResult.status === "rejected" ? "rejected" : "manual_review";
    const documentUrl = input.document ? await professionalVerificationRepository.uploadDocument(user.id, input.document) : undefined;
    const verification = await professionalVerificationRepository.submit({
      userId: user.id,
      fullName,
      cpfHash: await hashCpf(cpf),
      crefNumber,
      crefRegion,
      crefCategory: input.crefCategory.trim(),
      status,
      verificationMethod: "manual",
      matchedName: providerResult.matchedName,
      matchedRegion: providerResult.matchedRegion,
      matchedStatus: providerResult.matchedStatus,
      documentUrl,
    });

    await auditService.record({
      eventType: "professional_verification_submitted",
      metadata: { crefRegion, crefCategory: input.crefCategory.trim(), status },
      severity: "info",
      userId: user.id,
    });
    await auditService.record({
      eventType: status === "rejected" ? "professional_verification_rejected" : "professional_manual_review",
      metadata: { confidenceScore: providerResult.confidenceScore, status },
      severity: status === "rejected" ? "warning" : "info",
      userId: user.id,
    });

    if (!supabase && verification) userRepository.updateProfessionalVerificationStatus(user.id, status);
    return verification ? { ok: true as const, verification } : { errors: { profile: "Nao foi possivel enviar sua verificacao." }, ok: false as const };
  },
};
