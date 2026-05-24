import { MailCheck, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { AuthFrame } from "../features/auth/AuthFrame";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute } from "../types";

export default function VerifyEmail({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const logout = useAuthStore((state) => state.logout);
  const resendEmailConfirmation = useAuthStore((state) => state.resendEmailConfirmation);
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState("");

  const resendConfirmation = async () => {
    if (!user?.email) return;
    const result = await resendEmailConfirmation(user.email);
    setMessage(result.message ?? (result.ok ? "E-mail reenviado." : "Nao foi possivel reenviar agora."));
  };

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
        {message ? <p className="rounded-md border border-white/10 bg-white/[.04] p-3 text-sm text-zinc-200">{message}</p> : null}
        <Button disabled={!user?.email} onClick={resendConfirmation} type="button" variant="secondary">
          <Send size={17} />
          Reenviar confirmacao
        </Button>
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
