import { AuthShell } from "../components/auth/AuthShell";
import { Icon } from "../components/ui/Icon";
import type { AppRoute } from "../types";

export default function AuthSuccess({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  return (
    <AuthShell copy="Seu cadastro foi concluido. Verifique seu email para confirmar o acesso ao LIFTO." kicker="Cadastro enviado" title="Conta criada com sucesso">
      <div className="grid justify-items-center gap-5 text-center">
        <div className="anim-rise grid h-16 w-16 place-items-center rounded-2xl border border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]">
          <Icon name="check" size={30} stroke={2.4} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Verifique seu e-mail para continuar.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--fg-3)]">
            Mantemos a confirmacao ativa no Supabase para proteger sua conta antes do primeiro acesso completo.
          </p>
        </div>
        <button className="btn btn-primary min-h-12 w-full justify-center" onClick={() => onNavigate("login")} type="button">
          Voltar para login
        </button>
      </div>
    </AuthShell>
  );
}
