import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AuthFrame } from "../features/auth/AuthFrame";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User } from "../types";

export default function Register({
  onNavigate,
  routeForUser,
}: {
  onNavigate: (route: AppRoute) => void;
  routeForUser: (user: User) => AppRoute;
}) {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [professional, setProfessional] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("As senhas precisam ser iguais.");
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
    });
    if (!result.ok || !result.user) {
      setMessage(result.message ?? "Nao foi possivel criar sua conta.");
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
      <form className="grid gap-3" onSubmit={submit}>
        <label className="grid gap-2 text-sm">
          Nome
          <Input autoComplete="name" onChange={(event) => setName(event.target.value)} placeholder="Seu nome" required value={name} />
        </label>
        <label className="grid gap-2 text-sm">
          Email
          <Input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required type="email" value={email} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            Senha
            <Input autoComplete="new-password" minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          <label className="grid gap-2 text-sm">
            Confirmar senha
            <Input autoComplete="new-password" minLength={6} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
          </label>
        </div>
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

