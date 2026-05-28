import { useState, type FormEvent } from "react";
import { AuthShell } from "../components/auth/AuthShell";
import { Icon } from "../components/ui/Icon";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User } from "../types";

export default function Login({
  onNavigate,
  routeForUser,
}: {
  onNavigate: (route: AppRoute) => void;
  routeForUser: (user: User) => AppRoute;
}) {
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [manualOpen, setManualOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submitGoogle = async () => {
    setMessage("");
    const result = await loginWithGoogle();
    if (result.redirecting) {
      setMessage(result.message ?? "Redirecionando para o Google.");
      return;
    }
    if (!result.ok) setMessage(result.message ?? "Nao foi possivel autenticar com Google.");
  };

  const submitManual = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (!email.trim() || !password) {
      setMessage("Informe email e senha para entrar.");
      return;
    }
    const result = await login({ email, password });
    if (result.ok && result.user) {
      onNavigate(routeForUser(result.user));
      return;
    }
    if (result.requiresEmailConfirmation) {
      onNavigate("verify-email");
      return;
    }
    setMessage(result.message ?? "Nao foi possivel entrar.");
  };

  return (
    <AuthShell copy="Login rapido com Google em destaque, ou acesso manual para contas criadas por email." kicker="LIFTO" title="Entrar">
      <div className="grid gap-4">
        <button
          className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[var(--fg)] px-5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-[var(--lime)] disabled:opacity-70"
          disabled={isLoading}
          onClick={submitGoogle}
          type="button"
        >
          {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" /> : <Icon name="google" size={18} stroke={0} />}
          Continuar com Google
        </button>

        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
          <span className="h-px flex-1 bg-[var(--border)]" />
          Alternativa
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {!manualOpen ? (
          <div className="grid gap-2 text-center text-sm">
            <button className="text-[var(--fg-2)] underline-offset-4 transition hover:text-[var(--lime)] hover:underline" onClick={() => onNavigate("register")} type="button">
              Criar conta com email
            </button>
            <button className="text-[var(--fg-2)] underline-offset-4 transition hover:text-[var(--lime)] hover:underline" onClick={() => setManualOpen(true)} type="button">
              Entrar com email e senha
            </button>
          </div>
        ) : (
          <form className="grid gap-3" onSubmit={submitManual}>
            <label className="grid gap-1.5 text-sm font-medium text-[var(--fg-2)]">
              Email
              <input className="input" inputMode="email" onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" type="email" value={email} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[var(--fg-2)]">
              Senha
              <input className="input" onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" type="password" value={password} />
            </label>
            <button className="btn btn-primary min-h-12 justify-center" disabled={isLoading} type="submit">
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              <button className="text-[var(--fg-3)] hover:text-[var(--lime)]" onClick={() => onNavigate("reset-password")} type="button">
                Esqueci minha senha
              </button>
              <button className="text-[var(--fg-3)] hover:text-[var(--lime)]" onClick={() => onNavigate("register")} type="button">
                Criar conta
              </button>
            </div>
          </form>
        )}

        {message ? (
          <p className="rounded-xl border border-[var(--coral-line)] bg-[var(--coral-soft)] p-3 text-sm text-red-100">
            {message}
          </p>
        ) : null}
      </div>
    </AuthShell>
  );
}
