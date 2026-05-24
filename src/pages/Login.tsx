import { AlertCircle, ArrowRight, BriefcaseBusiness, Eye, EyeOff, KeyRound, LoaderCircle, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AuthFrame } from "../features/auth/AuthFrame";
import { inviteService } from "../services/inviteService";
import { validationService } from "../services/validationService";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User } from "../types";

export default function Login({
  onNavigate,
  routeForUser,
}: {
  onNavigate: (route: AppRoute) => void;
  routeForUser: (user: User) => AppRoute;
}) {
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const resendEmailConfirmation = useAuthStore((state) => state.resendEmailConfirmation);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [asProfessional, setAsProfessional] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const inviteCode = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("invite");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const emailValidation = validationService.validateEmail(email);
    if (!emailValidation.isValid) {
      setMessage(emailValidation.message ?? "Email invalido.");
      return;
    }
    if (!password) {
      setMessage("Informe sua senha.");
      return;
    }
    const result = await login({ email, password, asProfessional });
    if (!result.ok || !result.user) {
      if (result.requiresEmailConfirmation) setPendingEmail(result.email ?? emailValidation.normalized);
      setMessage(result.message ?? "Nao foi possivel entrar.");
      return;
    }
    if (inviteCode) inviteService.acceptInvite(inviteCode, result.user);
    onNavigate(routeForUser(result.user));
  };

  const resendConfirmation = async () => {
    const targetEmail = pendingEmail || email;
    const result = await resendEmailConfirmation(targetEmail);
    if (result.ok && result.email) setPendingEmail(result.email);
    setMessage(result.message ?? (result.ok ? "E-mail reenviado." : "Nao foi possivel reenviar agora."));
  };

  const submitGoogle = async () => {
    setMessage("");
    const result = await loginWithGoogle();
    if (result.redirecting) return;
    if (!result.ok || !result.user) {
      setMessage(result.message ?? "Nao foi possivel entrar com Google.");
      return;
    }
    if (inviteCode) inviteService.acceptInvite(inviteCode, result.user);
    onNavigate(routeForUser(result.user));
  };

  return (
    <AuthFrame
      copy="Acesse seu treino com email e senha ou continue com Google em uma janela segura do provedor."
      eyebrow="Acesso seguro"
      title="Entrar na Lifting"
    >
      <div className="grid gap-5">
        <Button
          className="min-h-12 w-full border border-white/10 bg-white text-zinc-950 hover:bg-lime"
          disabled={isLoading}
          onClick={submitGoogle}
          type="button"
          variant="secondary"
        >
          {isLoading ? <LoaderCircle className="animate-spin" size={18} /> : <span className="grid h-5 w-5 place-items-center rounded-full bg-zinc-950 text-sm font-bold text-white">G</span>}
          Entrar com Google
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase text-zinc-500">
          <span className="h-px flex-1 bg-white/10" />
          ou entre com email
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-medium text-zinc-200">
            Email
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3.5 text-zinc-500" size={17} />
              <Input
                autoComplete="email"
                className="min-h-12 border-white/10 bg-black/30 pl-10"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-medium text-zinc-200">
            Senha
            <span className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-3.5 text-zinc-500" size={17} />
              <Input
                autoComplete="current-password"
                className="min-h-12 border-white/10 bg-black/30 pl-10 pr-12"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-1.5 grid h-9 w-9 place-items-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
                onClick={() => setShowPassword((next) => !next)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>

          <label className="flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-white/[.03] px-3 text-sm text-zinc-200">
            <input
              checked={asProfessional}
              className="h-4 w-4 accent-lime"
              onChange={(event) => setAsProfessional(event.target.checked)}
              type="checkbox"
            />
            <BriefcaseBusiness className="text-lime" size={17} />
            Entrar como profissional
          </label>

          {message ? (
            <p className="flex items-start gap-2 rounded-md border border-coral/25 bg-coral/15 p-3 text-sm text-red-100">
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              {message}
            </p>
          ) : null}

          {pendingEmail ? (
            <Button disabled={isLoading} onClick={resendConfirmation} type="button" variant="secondary">
              <Send size={17} />
              Reenviar confirmacao
            </Button>
          ) : null}

          <Button className="min-h-12 w-full" disabled={isLoading} type="submit">
            {isLoading ? <LoaderCircle className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            Entrar
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <button className="text-zinc-300 transition hover:text-white" onClick={() => onNavigate("reset-password")}>
            Recuperar senha
          </button>
          <button className="font-semibold text-lime transition hover:text-white" onClick={() => onNavigate("register")}>
            Criar conta
          </button>
        </div>

      </div>
    </AuthFrame>
  );
}
