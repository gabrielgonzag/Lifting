import { useMemo, useState, type FormEvent } from "react";
import { AuthShell } from "../components/auth/AuthShell";
import { Icon } from "../components/ui/Icon";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User, UserRole } from "../types";
import { validatePassword } from "../utils/validators/passwordValidator";

export default function Register({
  onNavigate,
  routeForUser,
}: {
  onNavigate: (route: AppRoute) => void;
  routeForUser: (user: User) => AppRoute;
}) {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Extract<UserRole, "casual" | "professional">>("casual");
  const [message, setMessage] = useState("");
  const passwordState = useMemo(() => validatePassword(password), [password]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("As senhas nao conferem.");
      return;
    }
    const result = await register({
      email,
      name,
      password,
      role,
      plan: role === "professional" ? "coach" : "entry",
    });
    if (result.ok && result.user) {
      onNavigate(routeForUser(result.user));
      return;
    }
    if (result.ok && result.requiresEmailConfirmation) {
      onNavigate("auth-success");
      return;
    }
    sessionStorage.setItem("lifting_auth_error", result.message ?? "Verifique os dados informados e tente novamente.");
    onNavigate("auth-error");
  };

  return (
    <AuthShell copy="Crie sua conta manualmente. O Google continua sendo o caminho mais rapido, mas email e senha tambem estao de volta." kicker="Cadastro" title="Criar conta">
      <form className="grid gap-4" onSubmit={submit}>
        <label className="grid gap-1.5 text-sm font-medium text-[var(--fg-2)]">
          Nome
          <input className="input" onChange={(event) => setName(event.target.value)} placeholder="Seu nome" value={name} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[var(--fg-2)]">
          Email
          <input className="input" inputMode="email" onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" type="email" value={email} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-[var(--fg-2)]">
            Senha
            <input className="input" onChange={(event) => setPassword(event.target.value)} placeholder="Lifto123" type="password" value={password} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[var(--fg-2)]">
            Confirmar senha
            <input className="input" onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita a senha" type="password" value={confirmPassword} />
          </label>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Forca da senha</p>
            <span className="badge">{passwordState.strength}</span>
          </div>
          <div className="grid gap-1.5 text-xs text-[var(--fg-3)]">
            <CheckLine checked={passwordState.checks.minLength} label="8 caracteres" />
            <CheckLine checked={passwordState.checks.uppercase} label="1 letra maiuscula" />
            <CheckLine checked={passwordState.checks.number} label="1 numero" />
            <CheckLine checked={passwordState.checks.special} label="caractere especial recomendado" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="rounded-xl border p-3 text-left transition"
            onClick={() => setRole("casual")}
            style={{ background: role === "casual" ? "var(--lime-soft)" : "var(--card)", borderColor: role === "casual" ? "var(--lime-line)" : "var(--border)" }}
            type="button"
          >
            <span className="text-sm font-semibold">Aluno</span>
            <span className="mt-1 block text-xs text-[var(--fg-3)]">Treinar e evoluir</span>
          </button>
          <button
            className="rounded-xl border p-3 text-left transition"
            onClick={() => setRole("professional")}
            style={{ background: role === "professional" ? "var(--lime-soft)" : "var(--card)", borderColor: role === "professional" ? "var(--lime-line)" : "var(--border)" }}
            type="button"
          >
            <span className="text-sm font-semibold">Profissional</span>
            <span className="mt-1 block text-xs text-[var(--fg-3)]">Gerenciar alunos</span>
          </button>
        </div>

        <button className="btn btn-primary min-h-12 justify-center" disabled={isLoading} type="submit">
          {isLoading ? "Criando..." : "Criar conta"}
        </button>
        <button className="text-sm text-[var(--fg-3)] hover:text-[var(--lime)]" onClick={() => onNavigate("login")} type="button">
          Ja tenho conta
        </button>
        {message ? <p className="rounded-xl border border-[var(--coral-line)] bg-[var(--coral-soft)] p-3 text-sm text-red-100">{message}</p> : null}
      </form>
    </AuthShell>
  );
}

function CheckLine({ checked, label }: { checked: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2" style={{ color: checked ? "var(--lime)" : "var(--fg-3)" }}>
      <Icon name={checked ? "check" : "x"} size={13} />
      {label}
    </span>
  );
}
