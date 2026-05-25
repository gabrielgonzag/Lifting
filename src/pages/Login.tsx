import { useState } from "react";
import { Icon } from "../components/ui/Icon";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, User } from "../types";

export default function Login(_props: {
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
    if (!result.ok) setMessage(result.message ?? "Nao foi possivel autenticar com Google.");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 500px at 10% 0%, rgba(205,255,0,0.10), transparent 60%), radial-gradient(700px 600px at 100% 100%, rgba(255,107,91,0.06), transparent 60%), linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 70%)",
          maskImage: "radial-gradient(circle at 50% 40%, black 0%, transparent 70%)",
        }}
      />

      <main className="relative grid flex-1 place-items-center px-6 py-12">
        <div className="grid w-full max-w-[360px] gap-10 text-center">
          <div className="anim-rise grid justify-items-center gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-[22px] bg-[var(--lime)] shadow-[0_16px_48px_rgba(205,255,0,0.25)]">
              <svg fill="none" height="48" viewBox="0 0 24 24" width="48">
                <path d="M5 7v10M9 4v16M15 4v16M19 7v10M3 12h2M19 12h2M9 12h6" stroke="#0a0a0a" strokeLinecap="round" strokeWidth="2.4" />
              </svg>
            </div>
            <div>
              <h1 className="m-0 text-5xl font-black leading-none tracking-[-0.045em] sm:text-6xl">LIFTING</h1>
              <p className="mt-4 text-base text-[var(--fg-2)] sm:text-lg">
                Treino serio. <span className="text-[var(--fg)]">Resultado real.</span>
              </p>
            </div>
          </div>

          <div className="anim-slide-up grid gap-3">
            <button
              className="inline-flex h-13 min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[var(--fg)] px-5 text-[15px] font-semibold text-[#0a0a0a] transition hover:bg-[var(--lime)] disabled:opacity-70"
              disabled={isLoading}
              onClick={submitGoogle}
              type="button"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Entrando...
                </>
              ) : (
                <>
                  <Icon name="google" size={18} stroke={0} />
                  Entrar com Google
                </>
              )}
            </button>
            <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--fg-3)]">
              No momento, o acesso ao LIFTING esta disponivel apenas com conta Google.
            </p>
            {message ? (
              <p className="rounded-xl border border-[var(--coral-line)] bg-[var(--coral-soft)] p-3 text-sm text-red-100">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="relative flex items-center justify-between px-6 py-5 text-xs tracking-wide text-[var(--fg-4)]">
        <span>v2.4.1</span>
        <span>2026 LIFTING</span>
      </footer>
    </div>
  );
}
