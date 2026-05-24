import { userRepository } from "../repositories/userRepository";
import type { AuthResult, LoginInput, RegisterInput } from "../types";
import { canAccessCoach } from "../utils/validators/permissionValidator";
import { validationService } from "./validationService";
import { hasSupabaseConfig, supabase } from "./databaseClient";

const missingSupabaseMessage =
  "Supabase nao configurado. Verifique as variaveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.";
const oauthPopupName = "lifting-google-auth";
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

const oauthRedirectUrl = () => `${window.location.origin}/`;
const shouldUseOAuthPopup = () => window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const oauthPopupFeatures = () => {
  const width = 520;
  const height = 680;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  return `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
};

const waitForSupabaseUser = async (popup: Window) => {
  const startedAt = Date.now();
  const timeoutMs = 90_000;

  while (Date.now() - startedAt < timeoutMs) {
    if (popup.closed) {
      return { ok: false, message: "Login com Google cancelado." } satisfies AuthResult;
    }

    const { data } = await supabase!.auth.getSession();
    if (data.session?.user) {
      popup.close();
      const user = await userRepository.ensureSupabaseProfile(data.session.user.id);
      return user ? ({ ok: true, user } satisfies AuthResult) : ({ ok: false, message: "Perfil Supabase nao encontrado." } satisfies AuthResult);
    }

    await new Promise((resolve) => window.setTimeout(resolve, 750));
  }

  popup.close();
  return { ok: false, message: "Tempo esgotado ao entrar com Google." } satisfies AuthResult;
};

export const authService = {
  async completeOAuthRedirect() {
    if (!supabase || typeof window === "undefined") return { ok: true } satisfies AuthResult;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (!code) return { ok: true } satisfies AuthResult;

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, message: error.message } satisfies AuthResult;

    url.searchParams.delete("code");
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash || "#home"}`);
    return { ok: true } satisfies AuthResult;
  },
  async currentUser() {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      return data.session?.user ? userRepository.ensureSupabaseProfile(data.session.user.id) : undefined;
    }
    return undefined;
  },
  async login({ email, password, asProfessional }: LoginInput): Promise<AuthResult> {
    const emailValidation = validationService.validateEmail(email);
    if (!emailValidation.isValid) return { ok: false, message: emailValidation.message };
    if (!password) return { ok: false, message: "Informe sua senha." };

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.normalized,
        password,
      });
      if (error || !data.user) {
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
      const user = await userRepository.ensureSupabaseProfile(data.user.id);
      if (!user) return { ok: false, message: "Perfil Supabase nao encontrado." };
      if (user.status === "suspended") {
        await supabase.auth.signOut();
        return { ok: false, message: "Esta conta esta suspensa. Fale com o suporte." };
      }
      if (!user.emailVerified || user.status === "pending_verification") {
        await supabase.auth.signOut();
        return {
          ok: false,
          email: user.email,
          requiresEmailConfirmation: true,
          message: "Confirme seu e-mail antes de entrar.",
        };
      }
      if (asProfessional && !canAccessCoach(user)) {
        await supabase.auth.signOut();
        return { ok: false, message: "Essa conta nao possui acesso ao plano COACH." };
      }
      return { ok: true, user };
    }
    return { ok: false, message: missingSupabaseMessage };
  },
  async loginWithGoogle(): Promise<AuthResult> {
    if (!supabase) {
      return { ok: false, message: "Login com Google requer Supabase configurado." };
    }

    if (!shouldUseOAuthPopup()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: oauthRedirectUrl(),
        },
      });
      return error ? { ok: false, message: error.message } : { ok: true, redirecting: true, message: "Redirecionando para o Google." };
    }

    const popup = window.open("about:blank", oauthPopupName, oauthPopupFeatures());
    if (!popup) {
      return { ok: false, message: "Permita popups para entrar com Google." };
    }
    popup.document.title = "Entrar com Google";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: oauthRedirectUrl(),
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      popup.close();
      return { ok: false, message: error.message };
    }

    if (!data.url) {
      popup.close();
      return { ok: false, message: "Nao foi possivel iniciar o Google." };
    }

    popup.location.href = data.url;
    return waitForSupabaseUser(popup);
  },
  async register(input: RegisterInput): Promise<AuthResult> {
    const name = validationService.sanitizeText(input.name);
    const emailValidation = validationService.validateEmail(input.email);
    const passwordValidation = validationService.validatePassword(input.password);
    if (!name) return { ok: false, message: "Informe seu nome." };
    if (!emailValidation.isValid) return { ok: false, message: emailValidation.message };
    if (!passwordValidation.isValid) return { ok: false, message: passwordValidation.messages[0] ?? "Use uma senha mais forte." };

    const email = emailValidation.normalized;
    const plan = input.plan ?? (input.role === "professional" ? "coach" : "entry");
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: input.password,
        options: {
          data: {
            name,
            role: input.role,
            plan,
          },
        },
      });
      if (error) return { ok: false, email, message: safeSignupError(error.message) };
      if (!data.user) return { ok: false, message: "Nao foi possivel criar sua conta." };
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { ok: false, email, message: duplicateEmailMessage };
      }
      if (!data.session) {
        return {
          ok: true,
          email,
          message: pendingConfirmationMessage,
          requiresEmailConfirmation: true,
        };
      }
      const user = await userRepository.ensureSupabaseProfile(data.user.id);
      if (!user?.emailVerified || user.status === "pending_verification") {
        await supabase.auth.signOut();
        return {
          ok: true,
          email,
          message: pendingConfirmationMessage,
          requiresEmailConfirmation: true,
        };
      }
      return user ? { ok: true, user } : { ok: false, message: "Conta criada. Entre novamente." };
    }
    return { ok: false, message: missingSupabaseMessage };
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
  async logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    userRepository.setSessionUserId();
  },
  async resetPassword(email: string): Promise<AuthResult> {
    const emailValidation = validationService.validateEmail(email);
    if (!emailValidation.isValid) return { ok: false, message: emailValidation.message };
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(emailValidation.normalized);
      return error
        ? { ok: false, message: error.message }
        : { ok: true, message: "Se houver uma conta, as instrucoes serao enviadas." };
    }
    return {
      ok: false,
      message: missingSupabaseMessage,
    };
  },
};

export const authBackend = hasSupabaseConfig ? "supabase" : "local";
