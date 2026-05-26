import type { FocusSet } from "./types";

export function NextSetPreview({ set }: { set?: FocusSet }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
      <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--fg-4)]">Proxima</p>
      <p className="mono mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--fg)]">
        {set ? `${set.weight || "-"} kg x ${set.reps} reps` : "Finalizar treino"}
      </p>
    </section>
  );
}
