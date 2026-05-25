import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../types";

const mocks = vi.hoisted(() => ({
  ensureSupabaseProfile: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  resend: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  setSessionUserId: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("./databaseClient", () => ({
  hasSupabaseConfig: true,
  supabase: {
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      getSession: mocks.getSession,
      getUser: mocks.getUser,
      resend: mocks.resend,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      signInWithPassword: mocks.signInWithPassword,
      signInWithOAuth: mocks.signInWithOAuth,
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

const stubWindowUrl = (href = "http://localhost:3000/#login") => {
  vi.stubGlobal("window", {
    location: {
      href,
      origin: "http://localhost:3000",
    },
    history: {
      pushState: vi.fn((_state: unknown, _title: string, nextUrl: string) => {
        (window.location as Location).href = new URL(nextUrl, "http://localhost:3000").href;
      }),
      replaceState: vi.fn(),
    },
  });
};

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    stubWindowUrl();
  });

  it("starts Google OAuth with the auth callback URL", async () => {
    const { authService } = await import("./authService");
    mocks.signInWithOAuth.mockResolvedValue({ error: null });

    const result = await authService.loginWithGoogle();

    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
    expect(result).toMatchObject({ ok: true, redirecting: true });
  });

  it("disables email and password registration", async () => {
    const { authService } = await import("./authService");

    const result = await authService.register({
      name: "Gabriel",
      email: "gabriel@lifting.test",
      password: "Strong123",
      role: "casual",
    });

    expect(result).toMatchObject({
      ok: false,
      message: "No momento, o acesso ao LIFTING esta disponivel apenas com conta Google.",
    });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("disables email and password login", async () => {
    const { authService } = await import("./authService");

    const result = await authService.login({
      email: "gabriel@lifting.test",
      password: "Strong123",
    });

    expect(result).toMatchObject({
      ok: false,
      message: "No momento, o acesso ao LIFTING esta disponivel apenas com conta Google.",
    });
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("loads and validates the Supabase profile after OAuth callback", async () => {
    const { authService } = await import("./authService");
    const casual = makeUser("casual");
    stubWindowUrl("http://localhost:3000/auth/callback?code=google-code");
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: casual.id } } });
    mocks.ensureSupabaseProfile.mockResolvedValue(casual);

    const result = await authService.completeOAuthRedirect();

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("google-code");
    expect(result).toMatchObject({ ok: true, user: casual });
  });

  it("returns Supabase OAuth errors from callback URL", async () => {
    const { authService } = await import("./authService");
    stubWindowUrl("http://localhost:3000/auth/callback?error=server_error&error_description=Unable+to+exchange+external+code");

    const result = await authService.completeOAuthRedirect();

    expect(result).toMatchObject({
      ok: false,
      message: "Unable to exchange external code",
    });
    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("blocks suspended profiles after OAuth callback", async () => {
    const { authService } = await import("./authService");
    stubWindowUrl("http://localhost:3000/auth/callback?code=google-code");
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "casual-user" } } });
    mocks.ensureSupabaseProfile.mockResolvedValue({ ...makeUser("casual"), status: "suspended" });

    const result = await authService.completeOAuthRedirect();

    expect(result).toMatchObject({
      ok: false,
      message: "Sua conta esta suspensa. Entre em contato com o suporte.",
    });
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });

  it("keeps pending profiles inside the verification flow", async () => {
    const { authService } = await import("./authService");
    const pending = { ...makeUser("casual"), emailVerified: false, status: "pending_verification" as const };
    stubWindowUrl("http://localhost:3000/auth/callback?code=google-code");
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: pending.id } } });
    mocks.ensureSupabaseProfile.mockResolvedValue(pending);

    const result = await authService.completeOAuthRedirect();

    expect(result).toMatchObject({
      ok: false,
      user: pending,
      requiresEmailConfirmation: true,
      message: "Sua conta ainda precisa ser verificada.",
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

  it("disables password reset while Google is the only auth entry point", async () => {
    const { authService } = await import("./authService");

    const result = await authService.resetPassword("  GABRIEL@LIFTING.TEST ");

    expect(result).toMatchObject({
      ok: false,
      message: "No momento, o acesso ao LIFTING esta disponivel apenas com conta Google.",
    });
    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
  });
});
