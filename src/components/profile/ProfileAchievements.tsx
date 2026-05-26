import { Icon } from "../ui/Icon";
import { achievementById } from "../../features/achievements/achievements";

export function ProfileAchievements({ achievementIds }: { achievementIds: string[] }) {
  const recent = achievementIds.slice(-3).reverse().map((id) => achievementById.get(id)).filter(Boolean);

  return (
    <section className="card card-pad">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="label">Conquistas recentes</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.025em]">Marcos desbloqueados</h2>
        </div>
        <span className="badge">{achievementIds.length} total</span>
      </div>
      {recent.length ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {recent.map((achievement) => (
            <article className="rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-4" key={achievement!.id}>
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-amber-300 text-zinc-950">
                <Icon name={achievement!.icon} size={18} />
              </div>
              <h3 className="font-bold">{achievement!.title}</h3>
              <p className="mt-1 text-sm text-[var(--fg-3)]">{achievement!.description}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-wider text-[var(--lime)]">+{achievement!.xpReward} XP</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-[var(--fg-3)]">
          Finalize um treino para desbloquear suas primeiras conquistas.
        </p>
      )}
    </section>
  );
}
