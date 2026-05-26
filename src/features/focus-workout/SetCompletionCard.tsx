import { motion } from "framer-motion";
import { Icon } from "../../components/ui/Icon";
import { achievementById } from "../achievements/achievements";

export function SetCompletionCard({
  achievementIds,
  prs,
  xpGained,
}: {
  achievementIds: string[];
  prs: number;
  xpGained: number;
}) {
  const firstAchievement = achievementIds.map((id) => achievementById.get(id)).find(Boolean);

  return (
    <motion.section
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] border border-amber-300/25 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,.20),rgba(255,255,255,.04)_42%,rgba(255,255,255,.02)_100%)] p-5 text-center shadow-[0_0_60px_rgba(251,191,36,.14)]"
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
    >
      {firstAchievement ? <ConfettiDust /> : null}
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/35 bg-amber-300 text-zinc-950">
        <Icon name={firstAchievement ? firstAchievement.icon : "trophy"} size={26} />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[.25em] text-amber-200">
        {firstAchievement ? "Nova conquista" : prs ? "Novo PR" : "Treino concluido"}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{firstAchievement?.title ?? (prs ? "Recorde registrado" : "Ritual completo")}</h2>
      <p className="mt-2 text-sm text-[var(--fg-3)]">
        {firstAchievement?.description ?? `${prs} PRs no treino. Progresso nao mente.`}
      </p>
      <p className="mono mt-4 text-3xl font-black text-[var(--lime)]">+{xpGained} XP</p>
    </motion.section>
  );
}

function ConfettiDust() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 12 }, (_, index) => (
        <motion.span
          animate={{
            opacity: [0, 0.9, 0],
            scale: [0.6, 1, 0.8],
            y: [0, 20 + (index % 4) * 10],
          }}
          className="absolute h-1.5 w-1.5 rounded-full bg-amber-200"
          initial={{ opacity: 0 }}
          key={index}
          style={{
            left: `${12 + ((index * 7) % 76)}%`,
            top: `${8 + ((index * 11) % 36)}%`,
          }}
          transition={{ delay: index * 0.035, duration: 1.2, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
