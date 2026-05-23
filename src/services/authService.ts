import { userRepository } from "../repositories/userRepository";
import type { AuthResult, LoginInput, RegisterInput } from "../types";
import { hasSupabaseConfig, supabase } from "./databaseClient";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const missingSupabaseMessage =
  "Supabase nao configurado. Verifique as variaveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.";
const oauthPopupName = "lifting-google-auth";

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
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });
      if (error || !data.user) return { ok: false, message: "Email ou senha invalidos." };
      const user = await userRepository.ensureSupabaseProfile(data.user.id);
      if (!user) return { ok: false, message: "Perfil Supabase nao encontrado." };
      if (asProfessional && user.role !== "professional" && user.role !== "admin") {
        await supabase.auth.signOut();
        return { ok: false, message: "Essa conta nao possui perfil profissional." };
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
    const email = normalizeEmail(input.email);
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: input.password,
        options: {
          data: {
            name: input.name.trim(),
            role: input.role,
            plan: input.role === "professional" ? "professional" : "free",
          },
        },
      });
      if (error) return { ok: false, message: error.message };
      if (!data.user) return { ok: false, message: "Nao foi possivel criar sua conta." };
      if (!data.session) {
        return {
          ok: true,
          message: "Conta criada. Confirme seu email para entrar.",
          requiresEmailConfirmation: true,
        };
      }
      const user = await userRepository.ensureSupabaseProfile(data.user.id);
      return user ? { ok: true, user } : { ok: false, message: "Conta criada. Entre novamente." };
    }
    return { ok: false, message: missingSupabaseMessage };
  },
  async logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    userRepository.setSessionUserId();
  },
  async resetPassword(email: string): Promise<AuthResult> {
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email));
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
