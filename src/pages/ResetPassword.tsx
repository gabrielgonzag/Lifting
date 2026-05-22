import { Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { AuthFrame } from "../features/auth/AuthFrame";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute } from "../types";

export default function ResetPassword({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await resetPassword(email);
    setMessage(result.message ?? "Solicitacao registrada.");
  };

  return (
    <AuthFrame
      copy="A recuperacao esta pronta para trocar o mock local por um provedor real quando o backend chegar."
      eyebrow="Senha"
      title="Recuperar acesso"
    >
      <form className="grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm">
          Email
          <span className="relative">
            <Mail className="pointer-events-none absolute left-3 top-3.5 text-zinc-500" size={17} />
            <Input className="pl-10" onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" required type="email" value={email} />
          </span>
        </label>
        {message ? <p className="rounded-md border border-lime/25 bg-lime/10 p-3 text-sm text-lime">{message}</p> : null}
        <Button type="submit">Enviar</Button>
      </form>
      <button className="mt-5 text-sm font-semibold text-lime" onClick={() => onNavigate("login")}>
        Voltar ao login
      </button>
    </AuthFrame>
  );
}

