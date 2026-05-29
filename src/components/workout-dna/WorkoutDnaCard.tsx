import { Icon } from "../ui/Icon";
import type { WorkoutDnaProfile } from "../../features/workout-dna/workoutDnaTypes";
import { workoutDnaArchetypeLabel, workoutDnaStyleLabel } from "../../features/workout-dna/workoutDnaRules";

type Props = {
  dna: WorkoutDnaProfile;
  compact?: boolean;
};

export function WorkoutDnaCard({ dna, compact = false }: Props) {
  return (
    <section className="card card-pad anim-rise">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]">
            <Icon name="sparkles" size={18} />
          </div>
          <div>
            <p className="label">Workout DNA</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.015em]">{workoutDnaArchetypeLabel(dna.archetype)}</h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--fg-3)]">{dna.summary}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]">
            {workoutDnaStyleLabel(dna.dominantStyle)}
          </span>
          {dna.secondaryArchetype ? <span className="badge">{workoutDnaArchetypeLabel(dna.secondaryArchetype)}</span> : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Score label="Consistencia" value={dna.scores.consistency} />
        <Score label="Forca" value={dna.scores.strength} />
        <Score label="Volume" value={dna.scores.volume} />
        <Score label="Equilibrio" value={dna.scores.balance} />
      </div>

      {!compact ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <DnaList icon="trophy" items={dna.strengths} title="Pontos fortes" />
          <DnaList icon="info" items={dna.attentionPoints} title="Pontos de atencao" />
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MiniMetric label="Frequencia media" value={`${dna.averageWeeklyFrequency.toFixed(1)}x/sem`} />
        <MiniMetric label="Grupo dominante" value={dna.dominantGroups[0]?.group ?? "Sem dados"} />
        <MiniMetric label="Exercicio assinatura" value={dna.favoriteExercises[0]?.name ?? "Sem dados"} />
      </div>
    </section>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-3)]">{label}</p>
        <span className="mono text-sm font-semibold text-[var(--fg)]">{value}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[var(--lime)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DnaList({ icon, items, title }: { icon: "info" | "trophy"; items: string[]; title: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="text-[var(--lime)]" name={icon} size={15} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-[var(--fg-2)]" key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--fg-3)]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--fg)]">{value}</p>
    </div>
  );
}
