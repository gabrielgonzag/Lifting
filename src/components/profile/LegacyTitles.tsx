import {
  getLegacyTitleProgress,
  legacyTierLabel,
  legacyTitles,
  requirementLabel,
  type LegacyTitle,
  type LegacyTitleStats,
} from "../../features/gamification/titles";
import { Icon } from "../ui/Icon";

const rarityClass: Record<LegacyTitle["rarity"], string> = {
  common: "border-white/10 bg-white/[.04] text-[var(--fg-2)]",
  epic: "border-violet-300/25 bg-violet-300/[.07] text-violet-100",
  legendary: "border-amber-300/25 bg-amber-300/[.08] text-amber-100",
  mythic: "border-[var(--lime)] bg-[var(--lime)]/10 text-[var(--lime)] shadow-[0_0_40px_rgba(190,255,0,.14)]",
  rare: "border-sky-300/25 bg-sky-300/[.07] text-sky-100",
};

export function LegacyTitles({ officialTitleIds, stats }: { officialTitleIds?: string[]; stats: LegacyTitleStats }) {
  const progress = getLegacyTitleProgress(stats);
  const officialUnlocked = officialTitleIds?.length
    ? legacyTitles.filter((title) => officialTitleIds.includes(title.id))
    : progress.unlocked;
  const current = officialUnlocked.at(-1) ?? progress.current;
  const nextTitles = legacyTitles.filter((title) => !officialUnlocked.some((item) => item.id === title.id)).slice(0, 3);
  const legendaryTitles = legacyTitles.filter((title) => title.tier >= 4);
  const isMythic = current.tier === 5;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(24,24,24,.98),rgba(10,10,10,.98))] p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300 opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-[var(--lime)] opacity-10 blur-3xl" />

      <div className="relative grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <p className="label">Bodybuilding Legacy</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <h2 className={`text-4xl font-black tracking-[-0.06em] sm:text-5xl ${isMythic ? "text-[var(--lime)]" : "text-[var(--fg)]"}`}>
              {current.name}
            </h2>
            <span className={`mb-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${rarityClass[current.rarity]}`}>
              Tier {current.tier} - {legacyTierLabel(current.tier)}
            </span>
          </div>
          <p className="mt-3 max-w-xl text-sm text-[var(--fg-3)]">{current.description}</p>
          <p className="mt-5 text-lg font-black tracking-[-0.03em] text-[var(--fg)]">
            {isMythic ? "Seu legado agora e eterno." : "Seu legado esta sendo construido."}
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wider text-[var(--fg-3)]">
                {progress.next ? `Proximo titulo: ${progress.next.name}` : "Hall da fama completo"}
              </p>
              <span className="mono text-xs text-[var(--fg-3)]">{progress.progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/[.05]">
              <span
                className="block h-full rounded-full bg-[linear-gradient(90deg,var(--lime),#f6d365,#ff9f1c)] transition-all duration-500"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--fg-3)]">
              {progress.next ? `Meta: ${requirementLabel(progress.next)}. A disciplina cria lendas.` : "Poucos chegam ate aqui. A conquista maxima."}
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <LegacyStat icon="dumbbell" label="Treinos" value={stats.workouts} />
          <LegacyStat icon="trophy" label="PRs" value={stats.prs} />
          <LegacyStat icon="flame" label="Streak" suffix="dias" value={stats.streak} />
          <LegacyStat icon="chart" label="Volume" suffix="kg" value={Math.round(stats.volume)} />
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--fg-3)]">Titulos desbloqueados</p>
            <span className="badge">{officialUnlocked.length}/{legacyTitles.length}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {officialUnlocked.slice(-6).reverse().map((title) => <TitlePill key={title.id} title={title} unlocked />)}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--fg-3)]">Proximos marcos</p>
            <span className="text-xs text-[var(--fg-3)]">Construido no ferro</span>
          </div>
          <div className="grid gap-2">
            {nextTitles.map((title) => <TitlePill key={title.id} title={title} />)}
          </div>
        </div>
      </div>

      <div className="relative mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[.04] p-4">
        <div className="mb-3 flex items-center gap-2 text-amber-100">
          <Icon name="trophy" size={16} />
          <p className="text-xs font-black uppercase tracking-wider">Titulos lendarios</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {legendaryTitles.map((title) => (
            <TitlePill
              key={title.id}
              title={title}
              unlocked={officialUnlocked.some((item) => item.id === title.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function LegacyStat({ icon, label, suffix, value }: { icon: "chart" | "dumbbell" | "flame" | "trophy"; label: string; suffix?: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
      <div className="mb-2 flex items-center gap-2 text-[var(--fg-3)]">
        <Icon name={icon} size={14} />
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black tracking-[-0.04em]">
        {value.toLocaleString("pt-BR")}
        {suffix ? <span className="ml-1 text-xs text-[var(--fg-3)]">{suffix}</span> : null}
      </p>
    </article>
  );
}

function TitlePill({ title, unlocked = false }: { title: LegacyTitle; unlocked?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-3 transition ${
        unlocked ? rarityClass[title.rarity] : "border-white/10 bg-white/[.025] text-[var(--fg-3)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{title.name}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-70">
            Tier {title.tier} - {legacyTierLabel(title.tier)}
          </p>
        </div>
        {title.rarity === "mythic" ? <Icon className="shrink-0 text-[var(--lime)]" name="sparkles" size={16} /> : null}
      </div>
      <p className="mt-2 text-xs opacity-75">{unlocked ? "Status conquistado." : requirementLabel(title)}</p>
    </div>
  );
}
