import { useState, type FormEvent } from "react";
import { AuthShell } from "../components/auth/AuthShell";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute } from "../types";

export default function ResetPassword({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setMessage("");
    const result = await resetPassword(email);
    setMessage(result.message ?? (result.ok ? "Verifique seu email." : "Nao foi possivel enviar agora."));
    setIsSending(false);
  };

  return (
    <AuthShell copy="Informe seu email e enviaremos as instrucoes de recuperacao pela Supabase Auth." kicker="Recuperacao" title="Redefinir senha">
      <form className="grid gap-4" onSubmit={submit}>
        <label className="grid gap-1.5 text-sm font-medium text-[var(--fg-2)]">
          Email
          <input className="input" inputMode="email" onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" type="email" value={email} />
        </label>
        <button className="btn btn-primary min-h-12 justify-center" disabled={isSending} type="submit">
          {isSending ? "Enviando..." : "Enviar instrucoes"}
        </button>
        <button className="text-sm text-[var(--fg-3)] hover:text-[var(--lime)]" onClick={() => onNavigate("login")} type="button">
          Voltar para login
        </button>
        {message ? <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--fg-2)]">{message}</p> : null}
      </form>
    </AuthShell>
  );
}
