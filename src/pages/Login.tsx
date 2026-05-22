import { ArrowRight, BriefcaseBusiness, Chrome, KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { AuthFrame } from "../features/auth/AuthFrame";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Login({
  onNavigate,
  routeForUser,
}: {
  onNavigate: (route: AppRoute) => void;
  routeForUser: (user: User) => AppRoute;
}) {
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [asProfessional, setAsProfessional] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await login({ email, password, asProfessional });
    if (!result.ok || !result.user) {
      setMessage(result.message ?? "Nao foi possivel entrar.");
      return;
    }
    onNavigate(routeForUser(result.user));
  };

  const submitGoogle = async () => {
    const result = await loginWithGoogle();
    if (!result.ok) {
      setMessage(result.message ?? "Nao foi possivel entrar com Google.");
    }
  };

  return (
    <AuthFrame
      copy="Entre para abrir suas fichas, registrar series e separar a experiencia profissional."
      eyebrow="Acesso"
      title="Entrar"
    >
      <Button className="w-full" disabled={isLoading} onClick={submitGoogle} type="button" variant="secondary">
        <Chrome size={18} />
        Entrar com Google
      </Button>
      <div className="my-5 flex items-center gap-3 text-xs uppercase text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        ou use seu email
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <form className="grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm">
          Email
          <span className="relative">
            <Mail className="pointer-events-none absolute left-3 top-3.5 text-zinc-500" size={17} />
            <Input
              autoComplete="email"
              className="pl-10"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              required
              type="email"
              value={email}
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm">
          Senha
          <span className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-3.5 text-zinc-500" size={17} />
            <Input
              autoComplete="current-password"
              className="pl-10"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              required
              type="password"
              value={password}
            />
          </span>
        </label>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 text-sm">
          <input
            checked={asProfessional}
            className="h-4 w-4 accent-lime"
            onChange={(event) => setAsProfessional(event.target.checked)}
            type="checkbox"
          />
          <BriefcaseBusiness className="text-lime" size={17} />
          Entrar como profissional
        </label>
        {message ? <p className="rounded-md bg-coral/15 p-3 text-sm text-red-100">{message}</p> : null}
        <Button disabled={isLoading} type="submit">
          Entrar
          <ArrowRight size={18} />
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        <button className="text-zinc-300 hover:text-white" onClick={() => onNavigate("reset-password")}>
          Recuperar senha
        </button>
        <button className="font-semibold text-lime" onClick={() => onNavigate("register")}>
          Criar conta
        </button>
      </div>
    </AuthFrame>
  );
}
