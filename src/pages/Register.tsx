import { ArrowRight, CheckCircle2, Chrome, Circle } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AuthFrame } from "../features/auth/AuthFrame";
import { inviteService } from "../services/inviteService";
import { validationService } from "../services/validationService";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User } from "../types";
import { cn } from "../utils/cn";

export default function Register({
  onNavigate,
  routeForUser,
}: {
  onNavigate: (route: AppRoute) => void;
  routeForUser: (user: User) => AppRoute;
}) {
  const register = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [professional, setProfessional] = useState(false);
  const [message, setMessage] = useState("");
  const inviteCode = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("invite");
  const passwordValidation = useMemo(() => validationService.validatePassword(password), [password]);
  const emailValidation = useMemo(() => validationService.validateEmail(email), [email]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("As senhas precisam ser iguais.");
      return;
    }
    if (!emailValidation.isValid) {
      setMessage(emailValidation.message ?? "Email invalido.");
      return;
    }
    if (!passwordValidation.isValid) {
      setMessage(passwordValidation.messages[0] ?? "Use uma senha mais forte.");
      return;
    }
    if (!acceptedTerms) {
      setMessage("Aceite os termos para criar sua conta.");
      return;
    }
    const result = await register({
      name,
      email,
      password,
      role: professional ? "professional" : "casual",
      plan: professional ? "coach" : "entry",
    });
    if (!result.ok) {
      setMessage(result.message ?? "Nao foi possivel criar sua conta.");
      return;
    }
    if (result.requiresEmailConfirmation || !result.user) {
      setMessage(result.message ?? "Conta criada. Confirme seu email para entrar.");
      window.setTimeout(() => onNavigate("login"), 2400);
      return;
    }
    if (inviteCode) inviteService.acceptInvite(inviteCode, result.user);
    onNavigate(routeForUser(result.user));
  };

  const submitGoogle = async () => {
    setMessage("");
    const result = await loginWithGoogle();
    if (result.redirecting) return;
    if (!result.ok || !result.user) {
      setMessage(result.message ?? "Nao foi possivel continuar com Google.");
      return;
    }
    onNavigate(routeForUser(result.user));
  };

  return (
    <AuthFrame
      copy="Crie seu perfil para manter fichas, historico e recordes prontos para uma futura sincronizacao."
      eyebrow="Onboarding"
      title="Criar conta"
    >
      {inviteCode ? (
        <p className="mb-4 rounded-md border border-lime/20 bg-lime/10 p-3 text-sm text-lime">
          Convite detectado. Ao criar sua conta, o vinculo com o personal sera aplicado automaticamente.
        </p>
      ) : null}
      <Button className="w-full" disabled={isLoading} onClick={submitGoogle} type="button" variant="secondary">
        <Chrome size={18} />
        Continuar com Google
      </Button>
      <div className="my-5 flex items-center gap-3 text-xs uppercase text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        ou crie com email
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <form className="grid gap-3" onSubmit={submit}>
        <label className="grid gap-2 text-sm">
          Nome
          <Input autoComplete="name" onChange={(event) => setName(event.target.value)} placeholder="Seu nome" required value={name} />
        </label>
        <label className="grid gap-2 text-sm">
          Email
          <Input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required type="email" value={email} />
          {email && !emailValidation.isValid ? <span className="text-xs text-coral">{emailValidation.message}</span> : null}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            Senha
            <Input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          <label className="grid gap-2 text-sm">
            Confirmar senha
            <Input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
          </label>
        </div>
        <PasswordFeedback validation={passwordValidation} />
        <label className="flex min-h-11 items-center gap-3 text-sm text-zinc-200">
          <input checked={professional} className="h-4 w-4 accent-lime" onChange={(event) => setProfessional(event.target.checked)} type="checkbox" />
          Sou profissional de educacao fisica
        </label>
        <label className="flex min-h-11 items-start gap-3 text-sm text-zinc-300">
          <input checked={acceptedTerms} className="mt-1 h-4 w-4 accent-lime" onChange={(event) => setAcceptedTerms(event.target.checked)} type="checkbox" />
          Aceito os termos de uso e a politica de dados do ambiente local.
        </label>
        {message ? <p className="rounded-md bg-coral/15 p-3 text-sm text-red-100">{message}</p> : null}
        <Button disabled={isLoading} type="submit">
          Criar conta
          <ArrowRight size={18} />
        </Button>
      </form>
      <button className="mt-5 text-sm font-semibold text-lime" onClick={() => onNavigate("login")}>
        Ja tenho conta
      </button>
    </AuthFrame>
  );
}

function PasswordFeedback({ validation }: { validation: ReturnType<typeof validationService.validatePassword> }) {
  const items = [
    ["minLength", "8 caracteres"],
    ["uppercase", "letra maiuscula"],
    ["number", "numero"],
    ["special", "especial recomendado"],
  ] as const;

  return (
    <div className="rounded-md border border-white/10 bg-white/[.03] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase text-zinc-400">Forca da senha</span>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-semibold",
            validation.strength === "forte" && "bg-lime/15 text-lime",
            validation.strength === "media" && "bg-sky-400/15 text-sky-200",
            validation.strength === "fraca" && "bg-coral/15 text-red-100",
          )}
        >
          {validation.strength}
        </span>
      </div>
      <div className="mb-3 grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((item) => (
          <span
            className={cn(
              "h-1 rounded-full bg-white/10",
              validation.score > item && validation.strength === "fraca" && "bg-coral",
              validation.score > item && validation.strength === "media" && "bg-sky-300",
              validation.score > item && validation.strength === "forte" && "bg-lime",
            )}
            key={item}
          />
        ))}
      </div>
      <div className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
        {items.map(([key, label]) => {
          const ok = validation.checks[key];
          return (
            <span className={cn("flex items-center gap-2", ok && "text-lime")} key={key}>
              {ok ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
