import { levelTitle, XP_PER_LEVEL, xpProgressPercent } from "../../features/gamification/useGamificationStore";
import type { User } from "../../types";

const statusLabel = {
  active: "Ativo",
  pending_verification: "Verificacao pendente",
  suspended: "Suspenso",
};

export function ProfileHeader({ level, totalXp, user, xp }: { level: number; totalXp: number; user: User; xp: number }) {
  const percent = xpProgressPercent(xp);
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--lime-line)] bg-[radial-gradient(circle_at_15%_0%,rgba(190,255,0,.16),rgba(24,24,24,.96)_42%,rgba(10,10,10,.98))] p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[var(--lime)] opacity-10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-[var(--border-hi)] bg-[linear-gradient(135deg,#2b2b2b,#111)] text-xl font-black">
            {user.avatarUrl ? <img alt="" className="h-full w-full object-cover" src={user.avatarUrl} /> : initials}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-black tracking-[-0.045em]">{user.name}</h1>
            <p className="mt-1 text-sm text-[var(--fg-3)]">@{user.username ?? user.email.split("@")[0]}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]">Plano: {user.plan.toUpperCase()}</span>
              <span className="badge">Status: {statusLabel[user.status]}</span>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-80">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-[.16em] text-[var(--lime)]">
              LVL {level} - {levelTitle(level)}
            </p>
            <span className="mono text-xs text-[var(--fg-3)]">{percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/30">
            <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--lime),#f8ff6a)]" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-[var(--fg-3)]">
            {xp}/{XP_PER_LEVEL} XP para o proximo nivel · {totalXp} XP total
          </p>
        </div>
      </div>
    </section>
  );
}
