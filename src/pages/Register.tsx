import { AlertCircle, Chrome, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { AuthFrame } from "../features/auth/AuthFrame";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User } from "../types";

export default function Register(_props: {
  onNavigate: (route: AppRoute) => void;
  routeForUser: (user: User) => AppRoute;
}) {
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [message, setMessage] = useState("");

  const submitGoogle = async () => {
    setMessage("");
    const result = await loginWithGoogle();
    if (result.redirecting) {
      setMessage(result.message ?? "Redirecionando para o Google.");
      return;
    }
    if (!result.ok) {
      setMessage(result.message ?? "Nao foi possivel continuar com Google.");
    }
  };

  return (
    <AuthFrame
      copy="Criacao de conta por email e senha esta pausada. O cadastro acontece com seguranca pelo Google."
      eyebrow="Cadastro Google"
      title="Criar acesso"
    >
      <div className="grid gap-5">
        <Button
          className="min-h-12 w-full border border-white/10 bg-white text-zinc-950 hover:bg-lime"
          disabled={isLoading}
          onClick={submitGoogle}
          type="button"
          variant="secondary"
        >
          {isLoading ? <LoaderCircle className="animate-spin" size={18} /> : <Chrome size={18} />}
          Entrar com Google
        </Button>

        <div className="rounded-md border border-white/10 bg-white/[.04] p-4 text-sm text-zinc-300">
          No momento, o acesso ao LIFTING esta disponivel apenas com conta Google.
        </div>

        {message ? (
          <p className="flex items-start gap-2 rounded-md border border-coral/25 bg-coral/15 p-3 text-sm text-red-100">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            {message}
          </p>
        ) : null}
      </div>
    </AuthFrame>
  );
}
