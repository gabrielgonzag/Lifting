import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../types";

const mocks = vi.hoisted(() => ({
  ensureSupabaseProfile: vi.fn(),
  getSession: vi.fn(),
  resend: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  setSessionUserId: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("./databaseClient", () => ({
  hasSupabaseConfig: true,
  supabase: {
    auth: {
      getSession: mocks.getSession,
      resend: mocks.resend,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
      signUp: mocks.signUp,
    },
  },
}));

vi.mock("../repositories/userRepository", () => ({
  userRepository: {
    ensureSupabaseProfile: mocks.ensureSupabaseProfile,
    setSessionUserId: mocks.setSessionUserId,
  },
}));

const makeUser = (role: User["role"]): User => ({
  id: `${role}-user`,
  name: "Gabriel",
  email: "gabriel@lifting.test",
  emailVerified: true,
  role,
  plan: role === "professional" ? "coach" : role === "admin" ? "elite" : "entry",
  status: "active",
  createdAt: "2026-05-23T00:00:00.000Z",
  updatedAt: "2026-05-23T00:00:00.000Z",
});

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an email confirmation state when Supabase creates a user without a session", async () => {
    const { authService } = await import("./authService");
    mocks.signUp.mockResolvedValue({
      data: { user: { id: "new-user" }, session: null },
      error: null,
    });

    const result = await authService.register({
      name: "Gabriel",
      email: "  GABRIEL@LIFTING.TEST ",
      password: "Strong123",
      role: "casual",
    });

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "gabriel@lifting.test",
      password: "Strong123",
      options: { data: { name: "Gabriel", role: "casual", plan: "entry" } },
    });
    expect(result).toMatchObject({ ok: true, requiresEmailConfirmation: true });
  });

  it("blocks professional login when the account is casual", async () => {
    const { authService } = await import("./authService");
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: "casual-user" } },
      error: null,
    });
    mocks.ensureSupabaseProfile.mockResolvedValue(makeUser("casual"));

    const result = await authService.login({
      email: "gabriel@lifting.test",
      password: "Strong123",
      asProfessional: true,
    });

    expect(result).toMatchObject({ ok: false, message: "Essa conta nao possui acesso ao plano COACH." });
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });

  it("blocks login before email confirmation", async () => {
    const { authService } = await import("./authService");
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Email not confirmed" },
    });

    const result = await authService.login({
      email: "gabriel@lifting.test",
      password: "Strong123",
    });

    expect(result).toMatchObject({
      ok: false,
      email: "gabriel@lifting.test",
      requiresEmailConfirmation: true,
      message: "Confirme seu e-mail antes de entrar.",
    });
  });

  it("resends signup confirmation email through Supabase", async () => {
    const { authService } = await import("./authService");
    mocks.resend.mockResolvedValue({ error: null });

    const result = await authService.resendEmailConfirmation("  GABRIEL@LIFTING.TEST ");

    expect(mocks.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "gabriel@lifting.test",
    });
    expect(result).toMatchObject({
      ok: true,
      email: "gabriel@lifting.test",
      requiresEmailConfirmation: true,
    });
  });

  it("allows professional login for a professional profile", async () => {
    const { authService } = await import("./authService");
    const professional = makeUser("professional");
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: professional.id } },
      error: null,
    });
    mocks.ensureSupabaseProfile.mockResolvedValue(professional);

    const result = await authService.login({
      email: professional.email,
      password: "Strong123",
      asProfessional: true,
    });

    expect(result).toMatchObject({ ok: true, user: professional });
  });

  it("sends password reset requests through Supabase", async () => {
    const { authService } = await import("./authService");
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await authService.resetPassword("  GABRIEL@LIFTING.TEST ");

    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith("gabriel@lifting.test");
    expect(result).toMatchObject({
      ok: true,
      message: "Se houver uma conta, as instrucoes serao enviadas.",
    });
  });
});
