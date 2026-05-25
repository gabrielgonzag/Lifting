import { Chrome } from "lucide-react";
import { Button } from "../components/ui/button";
import { AuthFrame } from "../features/auth/AuthFrame";
import type { AppRoute } from "../types";

export default function ResetPassword({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  return (
    <AuthFrame
      copy="Recuperacao por senha esta pausada enquanto o LIFTING usa somente autenticacao Google."
      eyebrow="Acesso Google"
      title="Senha indisponivel"
    >
      <div className="grid gap-4">
        <div className="rounded-md border border-white/10 bg-white/[.04] p-4 text-sm text-zinc-300">
          <Chrome className="mb-3 text-lime" size={22} />
          No momento, o acesso ao LIFTING esta disponivel apenas com conta Google.
        </div>
        <Button onClick={() => onNavigate("login")} type="button">
          Voltar ao login
        </Button>
      </div>
    </AuthFrame>
  );
}
