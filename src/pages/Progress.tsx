import { Award, CalendarRange, Dumbbell } from "lucide-react";
import type { ReactNode } from "react";
import { ProgressCharts } from "../components/charts/MetricCharts";
import { SectionTitle } from "../components/common/SectionTitle";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { exercises } from "../data/exercises";
import { useAppStore } from "../store/useAppStore";
import { inCurrentWeek } from "../utils/format";

export default function Progress() {
  const sessions = useAppStore((state) => state.sessions);
  const mostTrained = Object.entries(
    sessions
      .flatMap((session) => session.exercises)
      .reduce<Record<string, number>>((totals, entry) => {
        totals[entry.exerciseId] = (totals[entry.exerciseId] ?? 0) + 1;
        return totals;
      }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
  const records = sessions.flatMap((session) =>
    session.exercises.flatMap((entry) =>
      entry.sets
        .filter((set) => set.isPersonalRecord)
        .map((set) => ({ id: set.id, exerciseId: entry.exerciseId, weight: set.weight })),
    ),
  );

  return (
    <div className="grid gap-5">
      <SectionTitle copy="Carga, volume, frequencia e recordes em um painel." title="Progresso" />
      <div className="grid gap-3 md:grid-cols-3">
        <Summary icon={<CalendarRange />} label="Frequencia semanal" value={`${sessions.filter((session) => inCurrentWeek(session.date)).length} treinos`} />
        <Summary icon={<Award />} label="Recordes marcados" value={`${records.length}`} />
        <Summary icon={<Dumbbell />} label="Exercicios treinados" value={`${mostTrained.length}`} />
      </div>
      <ProgressCharts sessions={sessions} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Exercicios mais treinados</h3>
          <div className="mt-4 grid gap-2">
            {mostTrained.map(([exerciseId, count]) => (
              <div className="flex items-center justify-between rounded-md bg-white/5 p-3" key={exerciseId}>
                <span>{exercises.find((exercise) => exercise.id === exerciseId)?.name}</span>
                <Badge>{count} sessoes</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Evolucao corporal futura</h3>
          <div className="mt-4 grid min-h-44 place-items-center rounded-md border border-dashed border-white/15 bg-white/5 p-4 text-center">
            <p className="max-w-md text-sm text-zinc-400">
              O espaco ja esta reservado para medidas como peso, cintura, coxa e percentual de gordura quando esse modulo entrar.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Summary({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="grid h-11 w-11 place-items-center rounded-md bg-white/10 text-sky">{icon}</div>
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </Card>
  );
}
