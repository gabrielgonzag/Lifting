import type { ReactNode } from "react";
import heroImage from "../../assets/gym-notebook-hero.png";

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
    <main className="min-h-screen bg-[#111315] px-4 py-5 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-7xl overflow-hidden rounded-lg border border-white/10 bg-[#181a1d] shadow-lift lg:grid-cols-[minmax(0,.98fr)_minmax(26rem,.72fr)]">
        <div className="relative hidden min-h-[42rem] overflow-hidden lg:block">
          <img alt="" className="absolute inset-0 h-full w-full object-cover" src={heroImage} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,14,.96),rgba(10,12,14,.72)_42%,rgba(10,12,14,.24)),linear-gradient(180deg,rgba(183,243,77,.16),rgba(10,12,14,.86)_72%)]" />
          <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
            <div>
              <p className="text-xs font-semibold uppercase text-lime">LIFTO</p>
              <h1 className="mt-5 max-w-xl text-5xl font-bold leading-tight xl:text-6xl">
                Treino, fichas e progresso em uma conta segura.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-zinc-300">
                Entre para continuar exatamente de onde parou, com historico e recordes preparados para sincronizacao real.
              </p>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3">
              {[
                ["Fichas", "sempre a mao"],
                ["Recordes", "progresso claro"],
                ["Historico", "continuidade"],
              ].map(([label, value]) => (
                <div className="rounded-md border border-white/10 bg-black/35 p-4 backdrop-blur" key={label}>
                  <p className="text-lg font-bold text-lime">{label}</p>
                  <p className="mt-1 text-xs text-zinc-300">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex min-h-[calc(100vh-2.5rem)] items-center px-5 py-8 sm:px-8 lg:min-h-0 lg:px-10 xl:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <p className="text-xs font-semibold uppercase text-lime">LIFTO</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight">Seu treino agora tem conta.</h1>
            </div>
            <p className="text-sm font-semibold text-lime">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">{copy}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
