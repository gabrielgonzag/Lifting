import { userRepository } from "../repositories/userRepository";
import type { AuthResult, LoginInput, RegisterInput } from "../types";
import { hasSupabaseConfig, supabase } from "./databaseClient";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const missingSupabaseMessage =
  "Supabase nao configurado. Verifique as variaveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.";

export const authService = {
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

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    return error ? { ok: false, message: error.message } : { ok: true };
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
