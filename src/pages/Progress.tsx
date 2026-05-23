import { CalendarDays, Flame, Trophy, TrendingUp } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { lazy, Suspense, useMemo, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { SectionTitle } from "../components/common/SectionTitle";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { useAppStore } from "../store/useAppStore";
import type { PersonalRecord, WorkoutSession } from "../types";
import { formatLongDate, inCurrentWeek } from "../utils/format";
import { recordLabel } from "../utils/records";

const StrengthChart = lazy(() =>
  import("../components/charts/MetricCharts").then((module) => ({
    default: module.StrengthChart as ComponentType<{ exerciseId: string; records: PersonalRecord[] }>,
  })),
);
const FrequencyChart = lazy(() =>
  import("../components/charts/MetricCharts").then((module) => ({
    default: module.FrequencyChart as ComponentType<{ sessions: WorkoutSession[] }>,
  })),
);

export default function Progress() {
  const sessions = useAppStore((state) => state.sessions);
  const records = useAppStore((state) => state.personalRecords);
  const recordExercises = useMemo(
    () => [...new Map(records.map((record) => [record.exerciseId, record.exerciseName])).entries()],
    [records],
  );
  const [exerciseId, setExerciseId] = useState(recordExercises[0]?.[0] ?? "");
  const selectedExercise = recordExercises.find(([id]) => id === exerciseId)?.[1];
  const oneRmRecords = records.filter((record) => record.type === "estimated_1rm");
  const recentRecord = [...records].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())[0];
  const monthlySessions = sessions.filter((session) => {
    const date = new Date(session.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const strongestGrowth = useMemo(() => {
    const grouped = oneRmRecords.reduce<Record<string, typeof oneRmRecords>>((items, record) => {
      items[record.exerciseId] = [...(items[record.exerciseId] ?? []), record];
      return items;
    }, {});
    return Object.values(grouped)
      .map((items) => {
        const sorted = [...items].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
        return { name: sorted.at(-1)?.exerciseName, gain: (sorted.at(-1)?.value ?? 0) - (sorted[0]?.value ?? 0) };
      })
      .sort((left, right) => right.gain - left.gain)[0];
  }, [oneRmRecords]);

  if (sessions.length === 0) {
    return (
      <EmptyState
        description="Finalize um treino para acompanhar consistencia e evolucao de forca."
        icon={<TrendingUp />}
        title="Seu progresso comeca no primeiro treino"
      />
    );
  }

  return (
    <div className="grid gap-5">
      <SectionTitle copy="Forca e frequencia, sem ruido." title="Progresso" />
      <Card className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm font-semibold text-lime">Insight da semana</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {sessions.filter((session) => inCurrentWeek(session.date)).length
              ? "Voce manteve a ficha em movimento."
              : "Sua consistencia volta no proximo treino."}
          </h2>
          <p className="mt-2 max-w-2xl text-zinc-400">
            {strongestGrowth?.gain
              ? `${strongestGrowth.name} ganhou ${Math.round(strongestGrowth.gain)} kg no 1RM estimado desde o primeiro marco.`
              : "Quando novos PRs surgirem, o app mostra o exercicio que mais evoluiu."}
          </p>
        </div>
        <label className="grid min-w-60 gap-2 text-sm">
          Exercicio no grafico
          <select
            className="min-h-12 rounded-md border border-white/10 bg-black/20 px-3"
            onChange={(event) => setExerciseId(event.target.value)}
            value={exerciseId}
          >
            {recordExercises.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
      </Card>
      <Suspense fallback={<Card className="h-[28rem] animate-pulse p-4" />}>
        <StrengthChart exerciseId={exerciseId} records={records} />
      </Suspense>
      <div className="grid gap-4 xl:grid-cols-[.82fr_1.18fr]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Insight icon={<CalendarDays />} label="Ultimo treino" value={sessions[0] ? formatLongDate(sessions[0].date) : "-"} />
          <Insight icon={<Flame />} label="Treinos no mes" value={`${monthlySessions.length}`} />
          <Insight icon={<Trophy />} label="PR recente" value={recentRecord ? `${recordLabel(recentRecord.type)} ${Math.round(recentRecord.value)} kg` : "-"} />
          <Card className="p-4">
            <p className="text-sm text-zinc-400">Exercicio em foco</p>
            <p className="mt-2 text-xl font-semibold">{selectedExercise ?? "Sem PR ainda"}</p>
            <Badge className="mt-3">{oneRmRecords.length} marcos de 1RM</Badge>
          </Card>
        </div>
        <Suspense fallback={<Card className="h-80 animate-pulse p-4" />}>
          <FrequencyChart sessions={sessions} />
        </Suspense>
      </div>
    </div>
  );
}

function Insight({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="grid h-11 w-11 place-items-center rounded-md bg-white/10 text-lime">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
      </div>
    </Card>
  );
}
