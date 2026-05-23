import { MailCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthFrame } from "../features/auth/AuthFrame";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute } from "../types";

export default function VerifyEmail({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <AuthFrame
      copy="Sua conta foi criada, mas ainda precisa da confirmacao enviada por email antes de liberar o app completo."
      eyebrow="Verificacao"
      title="Confirme seu email"
    >
      <div className="grid gap-4">
        <div className="rounded-md border border-lime/20 bg-lime/10 p-4 text-sm text-lime">
          <MailCheck className="mb-3" size={22} />
          Enviamos um link de verificacao para {user?.email ?? "seu email"}. Depois de confirmar, entre novamente para ativar sua sessao.
        </div>
        <Button
          onClick={async () => {
            await logout();
            onNavigate("login");
          }}
          type="button"
        >
          Voltar ao login
        </Button>
      </div>
    </AuthFrame>
  );
}
