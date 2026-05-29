import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../types";

const repository = vi.hoisted(() => ({
  submit: vi.fn(),
  uploadDocument: vi.fn(),
}));

const audit = vi.hoisted(() => ({
  record: vi.fn(),
}));

const users = vi.hoisted(() => ({
  updateProfessionalVerificationStatus: vi.fn(),
}));

vi.mock("../repositories/professionalVerificationRepository", () => ({
  professionalVerificationRepository: repository,
}));

vi.mock("../repositories/userRepository", () => ({
  userRepository: users,
}));

vi.mock("./auditService", () => ({
  auditService: audit,
}));

vi.mock("./databaseClient", () => ({
  supabase: undefined,
}));

const professional: User = {
  id: "professional-1",
  name: "Gabriel Gonzaga",
  email: "coach@lifto.test",
  emailVerified: true,
  role: "professional",
  plan: "coach",
  status: "active",
  professionalVerificationStatus: "pending",
  createdAt: "2026-05-29T00:00:00.000Z",
  updatedAt: "2026-05-29T00:00:00.000Z",
};

describe("cref verification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates required professional verification fields", async () => {
    const { crefVerificationService } = await import("./crefVerificationService");

    const result = await crefVerificationService.submit(professional, {
      acceptedTerms: false,
      cpf: "123",
      crefCategory: "",
      crefNumber: "",
      crefRegion: "",
      fullName: "G",
      publicConsultationAuthorized: false,
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toMatchObject({
      acceptedTerms: expect.any(String),
      cpf: expect.any(String),
      crefNumber: expect.any(String),
      fullName: expect.any(String),
      publicConsultationAuthorized: expect.any(String),
    });
    expect(repository.submit).not.toHaveBeenCalled();
  });

  it("submits only a CPF hash and keeps unverified professionals in manual review", async () => {
    const { crefVerificationService } = await import("./crefVerificationService");
    repository.submit.mockResolvedValue({
      id: "verification-1",
      status: "manual_review",
      userId: professional.id,
    });

    const result = await crefVerificationService.submit(professional, {
      acceptedTerms: true,
      cpf: "123.456.789-09",
      crefCategory: "Bacharel",
      crefNumber: "123456-G",
      crefRegion: "SP",
      fullName: "Gabriel Gonzaga",
      publicConsultationAuthorized: true,
    });

    expect(result.ok).toBe(true);
    expect(repository.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        cpfHash: expect.not.stringContaining("12345678909"),
        status: "manual_review",
        verificationMethod: "manual",
      }),
    );
    expect(users.updateProfessionalVerificationStatus).toHaveBeenCalledWith(professional.id, "manual_review");
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "professional_verification_submitted" }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "professional_manual_review" }));
  });
});
