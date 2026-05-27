import { userRepository } from "../repositories/userRepository";
import type { AuthResult, LoginInput, RegisterInput } from "../types";
import { canAccessCoach } from "../utils/validators/permissionValidator";
import { auditService } from "./auditService";
import { hasSupabaseConfig, supabase } from "./databaseClient";
import { validationService } from "./validationService";

const missingSupabaseMessage =
  "Supabase nao configurado. Verifique as variaveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.";
const duplicateEmailMessage = "Este email ja esta em uso.";
const pendingConfirmationMessage = "Conta criada. Verifique seu e-mail para confirmar o cadastro.";
const emailSendErrorMessage = "Nao foi possivel enviar o e-mail de confirmacao agora. Verifique a configuracao SMTP.";

const safeSignupError = (message: string) => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("already") || lowerMessage.includes("registered") || lowerMessage.includes("exists")) {
    return duplicateEmailMessage;
  }
  if (lowerMessage.includes("smtp") || lowerMessage.includes("email") || lowerMessage.includes("mail")) {
    return emailSendErrorMessage;
  }
  return "Nao foi possivel criar sua conta agora.";
};

const oauthRedirectUrl = () => `${window.location.origin}/auth/callback`;

const oauthErrorFromUrl = (url: URL) => {
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const error = url.searchParams.get("error") ?? hashParams.get("error");
  const description = url.searchParams.get("error_description") ?? hashParams.get("error_description");
  const code = url.searchParams.get("error_code") ?? hashParams.get("error_code");

  if (!error && !description && !code) return undefined;
  const safeDescription = description?.replace(/\+/g, " ");
  return safeDescription || code || error || "Nao foi possivel concluir o login com Google.";
};

const waitForSupabaseProfile = async (userId: string) => {
  const startedAt = Date.now();
  const timeoutMs = 8_000;

  while (Date.now() - startedAt < timeoutMs) {
    const user = await userRepository.ensureSupabaseProfile(userId);
    if (user) return user;
    await new Promise((resolve) => globalThis.setTimeout(resolve, 700));
  }

  return undefined;
};

const validateSupabaseProfile = async (userId: string): Promise<AuthResult> => {
  const user = await waitForSupabaseProfile(userId);
  if (!user) return { ok: false, message: "Nao foi possivel carregar seu perfil. Tente sair e entrar novamente." };
    if (user.status === "suspended") {
      await auditService.record({ eventType: "account_suspended", severity: "warning", userId: user.id });
      await supabase?.auth.signOut();
      return { ok: false, message: "Sua conta esta suspensa. Entre em contato com o suporte." };
  }
  if (!user.emailVerified || user.status === "pending_verification") {
    return {
      ok: false,
      user,
      email: user.email,
      requiresEmailConfirmation: true,
      message: "Sua conta ainda precisa ser verificada.",
    };
  }
  return { ok: true, user };
};

export const authService = {
  async completeOAuthRedirect() {
    if (!supabase || typeof window === "undefined") return { ok: true } satisfies AuthResult;

    const url = new URL(window.location.href);
    const oauthError = oauthErrorFromUrl(url);
    if (oauthError) return { ok: false, message: oauthError } satisfies AuthResult;

    const code = url.searchParams.get("code");
    if (!code) return { ok: false, message: "Retorno do Google sem codigo de autenticacao." } satisfies AuthResult;

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      await auditService.record({ eventType: "login_failed", metadata: { provider: "google" }, severity: "warning" });
      return { ok: false, message: error.message } satisfies AuthResult;
    }

    const { data } = await supabase.auth.getUser();
    return data.user ? validateSupabaseProfile(data.user.id) : ({ ok: false, message: "Sessao Google nao encontrada." } satisfies AuthResult);
  },
  async currentUser() {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return undefined;
      const result = await validateSupabaseProfile(data.session.user.id);
      return result.ok || result.requiresEmailConfirmation ? result.user : undefined;
    }
    return undefined;
  },
  async login({ email, password, asProfessional }: LoginInput): Promise<AuthResult> {
    const emailValidation = validationService.validateEmail(email);
    if (!emailValidation.isValid) return { ok: false, message: emailValidation.message };
    if (!password) return { ok: false, message: "Informe sua senha." };
    if (!supabase) return { ok: false, message: missingSupabaseMessage };

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailValidation.normalized,
      password,
    });

    if (error || !data.user) {
      await auditService.record({
        eventType: "login_failed",
        metadata: { email: emailValidation.normalized },
        severity: "warning",
      });
      const lowerMessage = error?.message.toLowerCase() ?? "";
      if (lowerMessage.includes("email not confirmed") || lowerMessage.includes("confirm")) {
        return {
          ok: false,
          email: emailValidation.normalized,
          message: "Confirme seu e-mail antes de entrar.",
          requiresEmailConfirmation: true,
        };
      }
      return { ok: false, message: "Email ou senha invalidos." };
    }

    const result = await validateSupabaseProfile(data.user.id);
    if (asProfessional && result.ok && result.user && !canAccessCoach(result.user)) {
      await auditService.record({
        eventType: "access_denied",
        metadata: { requested: "professional_login" },
        severity: "warning",
        userId: result.user.id,
      });
      await supabase.auth.signOut();
      return { ok: false, message: "Essa conta nao possui acesso profissional." };
    }
    if (result.ok && result.user) {
      await auditService.record({ eventType: "login_success", severity: "info", userId: result.user.id });
    }
    return result;
  },
  async loginWithGoogle(): Promise<AuthResult> {
    if (!supabase) {
      return { ok: false, message: "Login com Google requer Supabase configurado." };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: oauthRedirectUrl(),
      },
    });
    return error ? { ok: false, message: error.message } : { ok: true, redirecting: true, message: "Redirecionando para o Google." };
  },
  async register(input: RegisterInput): Promise<AuthResult> {
    const name = validationService.sanitizeText(input.name);
    const emailValidation = validationService.validateEmail(input.email);
    const passwordValidation = validationService.validatePassword(input.password);
    if (!name) return { ok: false, message: "Informe seu nome." };
    if (!emailValidation.isValid) return { ok: false, message: emailValidation.message };
    if (!passwordValidation.isValid) return { ok: false, message: passwordValidation.messages[0] ?? "Use uma senha mais forte." };
    if (!supabase) return { ok: false, message: missingSupabaseMessage };

    const email = emailValidation.normalized;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          name,
          requested_account_type: input.role === "professional" ? "professional" : "casual",
        },
      },
    });

    if (error) {
      await auditService.record({
        eventType: "login_failed",
        metadata: { email, phase: "signup" },
        severity: "warning",
      });
      return { ok: false, email, message: safeSignupError(error.message) };
    }
    if (!data.user) return { ok: false, message: "Nao foi possivel criar sua conta." };
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: false, email, message: duplicateEmailMessage };
    }
    if (!data.session) {
      await auditService.record({ eventType: "signup", metadata: { email }, severity: "info", userId: data.user.id });
      return {
        ok: true,
        email,
        message: pendingConfirmationMessage,
        requiresEmailConfirmation: true,
      };
    }

    const profile = await userRepository.ensureSupabaseProfile(data.user.id);
    if (!profile?.emailVerified || profile.status === "pending_verification") {
      await supabase.auth.signOut();
      return {
        ok: true,
        email,
        message: pendingConfirmationMessage,
        requiresEmailConfirmation: true,
      };
    }
    if (profile) await auditService.record({ eventType: "signup", severity: "info", userId: profile.id });
    return profile ? { ok: true, user: profile } : { ok: false, message: "Conta criada. Entre novamente." };
  },
  async resendEmailConfirmation(email: string): Promise<AuthResult> {
    const emailValidation = validationService.validateEmail(email);
    if (!emailValidation.isValid) return { ok: false, message: emailValidation.message };
    if (!supabase) return { ok: false, message: missingSupabaseMessage };

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: emailValidation.normalized,
    });

    return error
      ? { ok: false, email: emailValidation.normalized, message: safeSignupError(error.message) }
      : {
          ok: true,
          email: emailValidation.normalized,
          message: "Enviamos um novo e-mail de confirmacao.",
          requiresEmailConfirmation: true,
        };
  },
  async resetPassword(email: string): Promise<AuthResult> {
    const emailValidation = validationService.validateEmail(email);
    if (!emailValidation.isValid) return { ok: false, message: emailValidation.message };
    if (!supabase) return { ok: false, message: missingSupabaseMessage };

    const { error } = await supabase.auth.resetPasswordForEmail(emailValidation.normalized);
    await auditService.record({
      eventType: "password_reset_requested",
      metadata: { email: emailValidation.normalized },
      severity: "info",
    });
    return error
      ? { ok: false, message: error.message }
      : { ok: true, message: "Se houver uma conta, as instrucoes serao enviadas." };
  },
  async logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    await auditService.record({ eventType: "logout", severity: "info" });
    userRepository.setSessionUserId();
  },
};

export const authBackend = hasSupabaseConfig ? "supabase" : "local";
