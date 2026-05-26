import { motion } from "framer-motion";
import type { FocusSet } from "./types";

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function RestTimer({
  nextSet,
  onSkip,
  remaining,
  total,
}: {
  nextSet?: FocusSet;
  onSkip: () => void;
  remaining: number;
  total: number;
}) {
  const progress = total ? 1 - remaining / total : 1;
  const circumference = 2 * Math.PI * 44;

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[.04] p-5 text-center">
      <p className="text-xs font-black uppercase tracking-[.22em] text-[var(--fg-4)]">Descanso</p>
      <div className="relative mx-auto my-5 grid h-40 w-40 place-items-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="44" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
          <motion.circle
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            cx="50"
            cy="50"
            fill="none"
            initial={false}
            r="44"
            stroke="var(--lime)"
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth="6"
            transition={{ duration: 0.4 }}
          />
        </svg>
        <span className="mono text-5xl font-black tracking-[-0.06em]">{formatTime(remaining)}</span>
      </div>
      {nextSet ? (
        <p className="text-sm text-[var(--fg-3)]">
          Proxima: <span className="font-bold text-[var(--fg)]">{nextSet.weight || "-"} kg x {nextSet.reps} reps</span>
        </p>
      ) : (
        <p className="text-sm text-[var(--fg-3)]">Ultima serie. Fecha forte.</p>
      )}
      <button className="btn mt-4 min-h-11 w-full justify-center" onClick={onSkip} type="button">
        Pular descanso
      </button>
    </section>
  );
}
