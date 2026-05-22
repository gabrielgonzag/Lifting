import type { ReactNode } from "react";

export function AuthFrame({
  children,
  eyebrow,
  title,
  copy,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-lg border border-white/10 bg-panel/90 shadow-lift lg:grid-cols-[.92fr_1.08fr]">
        <div className="relative hidden min-h-[42rem] overflow-hidden border-r border-white/10 bg-zinc-950 p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(183,243,77,.18),transparent_38%),linear-gradient(315deg,rgba(120,216,255,.16),transparent_42%)]" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase text-lime">LIFTING</p>
            <h1 className="mt-4 max-w-md text-5xl font-bold leading-tight">Seu treino agora tem conta.</h1>
          </div>
          <p className="relative max-w-sm text-zinc-300">
            Fichas, historico e recordes ganham uma base preparada para usuarios reais.
          </p>
        </div>
        <div className="p-5 sm:p-8 lg:p-12">
          <p className="text-sm font-semibold text-lime">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold">{title}</h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">{copy}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}

