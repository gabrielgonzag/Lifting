import { useMemo, useState } from "react";
import { Icon } from "../components/ui/Icon";
import { WorkoutDnaCard } from "../components/workout-dna/WorkoutDnaCard";
import { useGamificationStore } from "../features/gamification/useGamificationStore";
import { workoutDnaService } from "../features/workout-dna/workoutDnaService";
import { useAppStore } from "../store/useAppStore";
import type { PersonalRecord, WorkoutSession } from "../types";
import { formatLongDate, inCurrentWeek } from "../utils/format";
import { recordLabel, recordValueLabel } from "../utils/records";

type ChartPoint = { date: string; kg: number };
type FrequencyPoint = { w: string; days: number };

export default function Progress() {
  const sessions = useAppStore((state) => state.sessions);
  const records = useAppStore((state) => state.personalRecords);
  const streak = useGamificationStore((state) => state.streak);
  const recordExercises = useMemo(
    () => [...new Map(records.map((record) => [record.exerciseId, record.exerciseName])).entries()],
    [records],
  );
  const [exerciseId, setExerciseId] = useState(recordExercises[0]?.[0] ?? "");
  const selectedExercise = recordExercises.find(([id]) => id === exerciseId)?.[1];
  const oneRmRecords = records.filter((record) => record.type === "estimated_1rm");
  const chartData = useMemo(() => recordsToPoints(records, exerciseId), [exerciseId, records]);
  const frequencyData = useMemo(() => sessionsToFrequency(sessions), [sessions]);
  const recentRecord = [...records].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())[0];
  const strongestGrowth = useMemo(() => strongestGain(oneRmRecords), [oneRmRecords]);
  const workoutDna = useMemo(
    () => workoutDnaService.calculate({ personalRecords: records, sessions, streak }),
    [records, sessions, streak],
  );

  if (sessions.length === 0) {
    return (
      <div className="grid min-h-full place-items-center px-5">
        <div className="card card-pad grid max-w-md justify-items-center gap-4 py-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--lime)]">
            <Icon name="chart" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Seu progresso comeca no primeiro treino</h1>
            <p className="mt-2 text-sm text-[var(--fg-3)]">Finalize um treino para acompanhar consistencia e evolucao de forca.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full overflow-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-6 pb-24 lg:px-8 lg:py-8">
        <section className="anim-rise relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-hi)] p-5">
          <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[var(--lime-soft)] blur-3xl" />
          <div className="relative flex gap-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]">
              <Icon name="sparkles" size={16} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--lime)]">Insight da semana</p>
              <h1 className="mt-1 text-xl font-semibold tracking-[-0.015em]">
                {sessions.filter((session) => inCurrentWeek(session.date)).length
                  ? "Voce manteve a ficha em movimento."
                  : "Sua consistencia volta no proximo treino."}
              </h1>
              <p className="mt-1 text-sm text-[var(--fg-3)]">
                {strongestGrowth?.gain
                  ? `${strongestGrowth.name} ganhou ${Math.round(strongestGrowth.gain)} kg no 1RM estimado desde o primeiro marco.`
                  : "Quando novos PRs surgirem, o app mostra o exercicio que mais evoluiu."}
              </p>
            </div>
          </div>
        </section>

        <WorkoutDnaCard compact dna={workoutDna} />

        <section className="card card-pad anim-rise">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.01em]">Evolucao de forca</h2>
              <p className="mt-1 text-sm text-[var(--fg-3)]">Marcos de PR por exercicio</p>
            </div>
            <select className="input w-auto min-w-56" onChange={(event) => setExerciseId(event.target.value)} value={exerciseId}>
              {recordExercises.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
          {chartData.length ? <LineChart data={chartData} /> : <p className="py-12 text-center text-sm text-[var(--fg-3)]">Sem PRs para este exercicio.</p>}
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.25fr_.9fr]">
          <section className="card card-pad anim-rise">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.01em]">Frequencia</h2>
                <p className="mt-1 text-sm text-[var(--fg-3)]">Treinos por semana</p>
              </div>
              <span className="badge border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]">
                Media {(frequencyData.reduce((sum, item) => sum + item.days, 0) / Math.max(1, frequencyData.length)).toFixed(1)}
              </span>
            </div>
            <BarChart data={frequencyData} />
          </section>

          <section className="card card-pad anim-rise">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-[-0.01em]">Conquistas recentes</h2>
              <p className="mt-1 text-sm text-[var(--fg-3)]">Voce esta construindo algo.</p>
            </div>
            <div className="grid gap-2">
              <Achievement icon="flame" sub={`${sessions.filter((session) => inCurrentWeek(session.date)).length} treinos nesta semana`} title="Consistencia ativa" tint="coral" />
              <Achievement icon="trophy" sub={recentRecord ? `${recordLabel(recentRecord.type)} ${recordValueLabel(recentRecord)}` : "sem PR recente"} title="PR recente" tint="lime" />
              <Achievement icon="calendar" sub={sessions[0] ? formatLongDate(sessions[0].date) : "-"} title="Ultimo treino" tint="sky" />
              <Achievement icon="chart" sub={selectedExercise ?? "Sem foco"} title="Exercicio em foco" tint="amber" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function recordsToPoints(records: PersonalRecord[], exerciseId: string): ChartPoint[] {
  return records
    .filter((record) => record.exerciseId === exerciseId && (record.type === "estimated_1rm" || record.type === "absolute_weight"))
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      kg: Math.round(record.value),
    }));
}

function sessionsToFrequency(sessions: WorkoutSession[]): FrequencyPoint[] {
  const now = new Date();
  return Array.from({ length: 8 }, (_, index) => {
    const start = new Date(now);
    start.setDate(now.getDate() - (7 - index) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const days = new Set(
      sessions
        .filter((session) => {
          const date = new Date(session.date);
          return date >= start && date < end;
        })
        .map((session) => new Date(session.date).toDateString()),
    ).size;
    return { w: index === 7 ? "Esta" : `S-${7 - index}`, days };
  });
}

function strongestGain(records: PersonalRecord[]) {
  const grouped = records.reduce<Record<string, PersonalRecord[]>>((items, record) => {
    items[record.exerciseId] = [...(items[record.exerciseId] ?? []), record];
    return items;
  }, {});
  return Object.values(grouped)
    .map((items) => {
      const sorted = [...items].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
      return { name: sorted.at(-1)?.exerciseName, gain: (sorted.at(-1)?.value ?? 0) - (sorted[0]?.value ?? 0) };
    })
    .sort((left, right) => right.gain - left.gain)[0];
}

function LineChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((item) => item.kg));
  const min = Math.min(...data.map((item) => item.kg));
  const range = max - min || 1;
  const points = data.map((item, index) => {
    const x = 4 + index * (92 / Math.max(1, data.length - 1));
    const y = 15 + (1 - (item.kg - min) / range) * 67;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${path} L ${points.at(-1)?.x ?? 4} 82 L ${points[0]?.x ?? 4} 82 Z`;
  const last = data.at(-1)!;
  const first = data[0]!;
  const delta = last.kg - first.kg;

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="label">Carga maxima</p>
          <p className="mono mt-1 text-3xl font-bold tracking-[-0.025em]">{last.kg}<span className="ml-2 text-sm text-[var(--fg-3)]">kg</span></p>
        </div>
        <span className="badge border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]">
          <Icon name="chevron_u" size={11} stroke={2.4} />
          +{delta.toFixed(1)}kg
        </span>
      </div>
      <svg className="h-56 w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#CDFF00" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#CDFF00" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((tick) => <line key={tick} stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" x1="4" x2="96" y1={15 + tick * 67} y2={15 + tick * 67} />)}
        <path d={area} fill="url(#line-grad)" />
        <path d={path} fill="none" stroke="#CDFF00" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
        {points.map((point) => <circle cx={point.x} cy={point.y} fill="#CDFF00" key={`${point.date}-${point.kg}`} r="0.9" />)}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-[var(--fg-4)]">
        {data.map((item) => <span key={`${item.date}-${item.kg}`}>{item.date}</span>)}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: FrequencyPoint[] }) {
  const max = Math.max(...data.map((item) => item.days), 7);
  return (
    <div className="flex h-44 items-end gap-2">
      {data.map((item, index) => {
        const isLast = index === data.length - 1;
        return (
          <div className="flex h-full flex-1 flex-col items-center gap-2" key={item.w}>
            <div className="flex w-full flex-1 items-end">
              <div
                className="anim-rise relative w-full rounded-md border"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "both",
                  background: isLast ? "var(--lime)" : "var(--card-hi)",
                  borderColor: isLast ? "transparent" : "var(--border-hi)",
                  height: `${(item.days / max) * 100}%`,
                }}
              >
                <span className="mono absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold" style={{ color: isLast ? "var(--lime)" : "var(--fg-3)" }}>{item.days}</span>
              </div>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--fg-4)]">{item.w}</span>
          </div>
        );
      })}
    </div>
  );
}

function Achievement({ icon, title, sub, tint }: { icon: "calendar" | "chart" | "flame" | "trophy"; title: string; sub: string; tint: "amber" | "coral" | "lime" | "sky" }) {
  const palette = {
    amber: { bg: "rgba(245, 196, 81, .12)", border: "rgba(245, 196, 81, .34)", fg: "#f5c451" },
    coral: { bg: "var(--coral-soft)", border: "var(--coral-line)", fg: "var(--coral)" },
    lime: { bg: "var(--lime-soft)", border: "var(--lime-line)", fg: "var(--lime)" },
    sky: { bg: "rgba(126, 196, 255, .12)", border: "rgba(126, 196, 255, .34)", fg: "#7ec4ff" },
  }[tint];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border" style={{ background: palette.bg, borderColor: palette.border, color: palette.fg }}>
        <Icon name={icon} size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--fg-3)]">{sub}</p>
      </div>
    </div>
  );
}
