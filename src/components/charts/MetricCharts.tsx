import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactElement } from "react";
import type { WorkoutSession } from "../../types";
import { exercises } from "../../data/exercises";
import { formatDay, sessionVolume } from "../../utils/format";
import { Card } from "../ui/card";

const chartTheme = {
  stroke: "rgba(255,255,255,0.12)",
  tick: "#a1a1aa",
};

export function ProgressCharts({ sessions }: { sessions: WorkoutSession[] }) {
  const chronological = [...sessions].reverse();
  const volumeData = chronological.map((session) => ({
    date: formatDay(session.date),
    volume: Math.round(sessionVolume(session)),
    frequency: session.exercises.length,
  }));
  const strengthData = chronological
    .flatMap((session) =>
      session.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        date: formatDay(session.date),
        max: Math.max(...exercise.sets.map((set) => set.weight), 0),
      })),
    )
    .filter((point) => point.exerciseId === "peito-1-supino-reto-com-barra");
  const recordData = exercises
    .map((exercise) => ({
      name: exercise.name.split(" ").slice(0, 2).join(" "),
      record: Math.max(
        ...sessions.flatMap((session) =>
          session.exercises
            .filter((entry) => entry.exerciseId === exercise.id)
            .flatMap((entry) => entry.sets.map((set) => set.weight)),
        ),
        0,
      ),
    }))
    .filter((exercise) => exercise.record > 0)
    .sort((left, right) => right.record - left.record)
    .slice(0, 5);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartFrame title="Volume total" copy="Carga por repeticoes a cada sessao.">
        <AreaChart data={volumeData}>
          <CartesianGrid stroke={chartTheme.stroke} vertical={false} />
          <XAxis dataKey="date" stroke={chartTheme.tick} />
          <YAxis stroke={chartTheme.tick} />
          <Tooltip contentStyle={{ background: "#242424", border: "1px solid rgba(255,255,255,.12)" }} />
          <Area dataKey="volume" fill="rgba(183,243,77,.18)" stroke="#B7F34D" strokeWidth={2} />
        </AreaChart>
      </ChartFrame>
      <ChartFrame title="Carga no supino" copy="Maior serie registrada por treino.">
        <LineChart data={strengthData}>
          <CartesianGrid stroke={chartTheme.stroke} vertical={false} />
          <XAxis dataKey="date" stroke={chartTheme.tick} />
          <YAxis stroke={chartTheme.tick} />
          <Tooltip contentStyle={{ background: "#242424", border: "1px solid rgba(255,255,255,.12)" }} />
          <Line dataKey="max" dot={{ fill: "#78D8FF" }} stroke="#78D8FF" strokeWidth={3} />
        </LineChart>
      </ChartFrame>
      <ChartFrame title="Frequencia" copy="Exercicios concluidos por sessao.">
        <BarChart data={volumeData}>
          <CartesianGrid stroke={chartTheme.stroke} vertical={false} />
          <XAxis dataKey="date" stroke={chartTheme.tick} />
          <YAxis stroke={chartTheme.tick} />
          <Tooltip contentStyle={{ background: "#242424", border: "1px solid rgba(255,255,255,.12)" }} />
          <Bar dataKey="frequency" fill="#FF6B57" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ChartFrame>
      <ChartFrame title="Recordes pessoais" copy="Top cargas registradas ate agora.">
        <BarChart data={recordData} layout="vertical">
          <CartesianGrid stroke={chartTheme.stroke} horizontal={false} />
          <XAxis type="number" stroke={chartTheme.tick} />
          <YAxis dataKey="name" type="category" width={92} stroke={chartTheme.tick} />
          <Tooltip contentStyle={{ background: "#242424", border: "1px solid rgba(255,255,255,.12)" }} />
          <Bar dataKey="record" fill="#B7F34D" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ChartFrame>
    </div>
  );
}

function ChartFrame({
  children,
  title,
  copy,
}: {
  children: ReactElement;
  title: string;
  copy: string;
}) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-zinc-400">{copy}</p>
      <div className="h-64 min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
