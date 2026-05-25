import { AuthShell } from "../components/auth/AuthShell";
import { Icon } from "../components/ui/Icon";
import type { AppRoute } from "../types";

export default function AuthError({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const message = sessionStorage.getItem("lifting_auth_error") || "Verifique os dados informados e tente novamente.";

  return (
    <AuthShell copy={message} kicker="Erro no cadastro" title="Nao foi possivel criar sua conta">
      <div className="grid justify-items-center gap-5 text-center">
        <div className="anim-rise grid h-16 w-16 place-items-center rounded-2xl border border-[var(--coral-line)] bg-[var(--coral-soft)] text-[var(--coral)]">
          <Icon name="x" size={30} stroke={2.4} />
        </div>
        <p className="text-sm leading-6 text-[var(--fg-3)]">
          O servidor retornou uma falha segura. Tente novamente ou volte para o login.
        </p>
        <div className="grid w-full gap-2 sm:grid-cols-2">
          <button className="btn btn-primary min-h-12 justify-center" onClick={() => onNavigate("register")} type="button">
            Tentar novamente
          </button>
          <button className="btn min-h-12 justify-center" onClick={() => onNavigate("login")} type="button">
            Voltar
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
