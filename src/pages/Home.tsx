import { Icon } from "../components/ui/Icon";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import type { AppView, PersonalRecord, WorkoutPlan } from "../types";
import { inCurrentWeek } from "../utils/format";
import { recordLabel } from "../utils/records";

const weekLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

const daysAgo = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `ha ${days} dias`;
  if (days < 14) return "ha 1 semana";
  return `ha ${Math.floor(days / 7)} semanas`;
};

export default function Home({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  const user = useAuthStore((state) => state.user);
  const plans = useAppStore((state) => state.plans);
  const sessions = useAppStore((state) => state.sessions);
  const records = useAppStore((state) => state.personalRecords);
  const lastSession = sessions[0];
  const continuePlan = plans.find((plan) => plan.id === lastSession?.workoutPlanId) ?? plans[0];
  const recentRecord = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const weeklySessions = sessions.filter((session) => inCurrentWeek(session.date));
  const weeklyVolume = weeklySessions.reduce(
    (total, session) =>
      total +
      session.exercises.reduce(
        (exerciseTotal, exercise) => exerciseTotal + exercise.sets.reduce((setTotal, set) => setTotal + set.weight * set.reps, 0),
        0,
      ),
    0,
  );
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="min-h-full overflow-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-6 pb-24 lg:px-8 lg:py-8">
        <header className="anim-rise">
          <p className="text-sm font-medium capitalize text-[var(--fg-3)]">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            {greet}, <span className="text-[var(--fg-2)]">{user?.name.split(" ")[0] ?? "atleta"}.</span>
          </h1>
        </header>

        {continuePlan ? (
          <ContinueCard plan={continuePlan} lastDate={lastSession?.date ?? continuePlan.updatedAt} onContinue={() => onNavigate("workout")} />
        ) : (
          <section className="card card-pad anim-rise">
            <div className="grid justify-items-center gap-4 py-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--lime)]">
                <Icon name="dumbbell" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Voce ainda nao tem nenhuma ficha.</h2>
                <p className="mt-2 text-sm text-[var(--fg-3)]">Crie sua primeira rotina e comece a registrar treinos hoje.</p>
              </div>
              <button className="btn btn-primary" onClick={() => onNavigate("plans")}>
                <Icon name="plus" size={16} />
                Criar primeira ficha
              </button>
            </div>
          </section>
        )}

        <section className="card card-pad anim-rise">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-3)]">Esta semana</p>
              <p className="mt-1 text-2xl font-bold tracking-[-0.025em]">
                {weeklySessions.length} <span className="text-sm font-medium text-[var(--fg-3)]">treino{weeklySessions.length === 1 ? "" : "s"}</span>
              </p>
            </div>
            <span className="badge border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]">
              <Icon name="flame" size={12} />
              consistencia
            </span>
          </div>
          <div className="flex gap-2">
            {weekLabels.map((label, index) => {
              const done = weeklySessions.some((session) => new Date(session.date).getDay() === index);
              return (
                <div className="grid flex-1 gap-1.5 text-center" key={`${label}-${index}`}>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">{label}</span>
                  <span className="h-8 rounded-md border" style={{ background: done ? "var(--lime)" : "var(--card)", borderColor: done ? "transparent" : "var(--border)" }} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatTile
            icon="trophy"
            label="Ultimo PR"
            sub={recentRecord ? daysAgo(recentRecord.date) : "sem registro"}
            value={recentRecord ? `${recordLabel(recentRecord.type)} ${Math.round(recentRecord.value)}kg` : "-"}
          />
          <StatTile icon="dumbbell" label="Volume da semana" sub={`${weeklySessions.length} sessoes`} value={`${(weeklyVolume / 1000).toFixed(1)}t`} />
          <StatTile icon="book" label="Fichas ativas" sub="ver todas" value={String(plans.length)} onClick={() => onNavigate("plans")} />
        </section>
      </div>
    </div>
  );
}

function ContinueCard({ plan, lastDate, onContinue }: { plan: WorkoutPlan; lastDate: string; onContinue: () => void }) {
  const exerciseCount = plan.blocks.flatMap((block) => block.exerciseIds).length;
  return (
    <section className="anim-rise relative overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--card-hi)] p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: plan.color }} />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-70 blur-3xl" style={{ background: plan.color }} />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="label" style={{ color: plan.color }}>Continuar onde parou</span>
            <span className="badge"><Icon name="clock" size={10} />{daysAgo(lastDate)}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{plan.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.muscleGroups.slice(0, 4).map((group) => <span className="badge" key={group}>{group}</span>)}
            <span className="px-1 text-xs text-[var(--fg-3)]">{exerciseCount} exercicios</span>
          </div>
        </div>
        <button className="btn btn-primary h-12 rounded-xl px-6" onClick={onContinue}>
          <Icon name="play" size={14} stroke={0} />
          Continuar treino
        </button>
      </div>
    </section>
  );
}

function StatTile({ icon, label, value, sub, onClick }: { icon: "book" | "dumbbell" | "trophy"; label: string; value: string; sub: string; onClick?: () => void }) {
  const Element = onClick ? "button" : "div";
  return (
    <Element className="card p-4 text-left transition hover:border-[var(--border-hi)] hover:bg-[var(--card-hi)]" onClick={onClick}>
      <div className="mb-2 flex items-center gap-2 text-[var(--fg-3)]">
        <Icon name={icon} size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold tracking-[-0.02em]">{value}</p>
      <p className="mt-1 text-xs text-[var(--fg-3)]">{sub}</p>
    </Element>
  );
}
