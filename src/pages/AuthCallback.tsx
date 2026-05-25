import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { AuthFrame } from "../features/auth/AuthFrame";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User } from "../types";

export default function AuthCallback({
  onNavigate,
  routeForUser,
}: {
  onNavigate: (route: AppRoute) => void;
  routeForUser: (user: User) => AppRoute;
}) {
  const completeOAuthRedirect = useAuthStore((state) => state.completeOAuthRedirect);
  const logout = useAuthStore((state) => state.logout);
  const [message, setMessage] = useState("Aguardando retorno seguro do Google.");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    completeOAuthRedirect().then((result) => {
      if (!alive) return;
      if (result.ok && result.user) {
        const nextRoute = routeForUser(result.user);
        window.history.replaceState({}, document.title, `/#${nextRoute}`);
        onNavigate(nextRoute);
        return;
      }
      if (result.requiresEmailConfirmation) {
        window.history.replaceState({}, document.title, "/#verify-email");
        onNavigate("verify-email");
        return;
      }
      setFailed(true);
      setMessage(result.message ?? "Nao foi possivel autenticar com Google.");
    });

    return () => {
      alive = false;
    };
  }, [completeOAuthRedirect, onNavigate, routeForUser]);

  return (
    <AuthFrame
      copy="Estamos validando sua sessao, carregando seu perfil e aplicando as permissoes do banco."
      eyebrow="Google OAuth"
      title={failed ? "Falha ao entrar" : "Conectando"}
    >
      <div className="grid gap-4">
        <div className="rounded-md border border-white/10 bg-white/[.04] p-4 text-sm text-zinc-200">
          {failed ? <AlertCircle className="mb-3 text-coral" size={24} /> : <LoaderCircle className="mb-3 animate-spin text-lime" size={24} />}
          <p>{message}</p>
        </div>

        {!failed ? (
          <p className="flex items-center gap-2 text-sm text-lime">
            <CheckCircle2 size={16} />
            Aguardando criacao e validacao do profile.
          </p>
        ) : (
          <Button
            onClick={async () => {
              await logout();
              window.history.replaceState({}, document.title, "/#login");
              onNavigate("login");
            }}
            type="button"
          >
            Voltar ao login
          </Button>
        )}
      </div>
    </AuthFrame>
  );
}
