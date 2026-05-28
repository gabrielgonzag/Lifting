import type { ReactNode } from "react";

export function AuthShell({ children, kicker, title, copy }: { children: ReactNode; kicker: string; title: string; copy: string }) {
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

      <main className="relative grid flex-1 place-items-center px-5 py-10">
        <div className="grid w-full max-w-[390px] gap-8">
          <div className="anim-rise grid justify-items-center gap-5 text-center">
            <div className="grid h-18 w-18 place-items-center rounded-[22px] bg-[var(--lime)] shadow-[0_16px_48px_rgba(205,255,0,0.25)]">
              <svg fill="none" height="44" viewBox="0 0 24 24" width="44">
                <path d="M5 7v10M9 4v16M15 4v16M19 7v10M3 12h2M19 12h2M9 12h6" stroke="#0a0a0a" strokeLinecap="round" strokeWidth="2.4" />
              </svg>
            </div>
            <div>
              <p className="label text-[var(--lime)]">{kicker}</p>
              <h1 className="mt-2 text-4xl font-black leading-none tracking-[-0.045em] sm:text-5xl">{title}</h1>
              <p className="mt-4 text-sm leading-6 text-[var(--fg-2)]">{copy}</p>
            </div>
          </div>

          <section className="anim-slide-up rounded-2xl border border-[var(--border)] bg-[rgba(21,21,21,.78)] p-4 shadow-2xl backdrop-blur sm:p-5">
            {children}
          </section>
        </div>
      </main>

      <footer className="relative flex items-center justify-between px-6 py-5 text-xs tracking-wide text-[var(--fg-4)]">
        <span>v2.4.1</span>
        <span>2026 LIFTO</span>
      </footer>
    </div>
  );
}
