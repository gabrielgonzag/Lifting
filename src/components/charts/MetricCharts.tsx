import {
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
import type { PersonalRecord, WorkoutSession } from "../../types";
import { formatDay, startOfWeek } from "../../utils/format";
import { Card } from "../ui/card";

const chartTheme = {
  stroke: "rgba(255,255,255,0.12)",
  tick: "#a1a1aa",
};

export function StrengthChart({
  exerciseId,
  records,
}: {
  exerciseId: string;
  records: PersonalRecord[];
}) {
  const recordDates = new Map<string, { date: string; weight?: number; oneRm?: number }>();
  records
    .filter((record) => record.exerciseId === exerciseId && record.type !== "set_volume")
    .forEach((record) => {
      const point = recordDates.get(record.date) ?? { date: record.date };
      if (record.type === "absolute_weight") point.weight = Math.round(record.value * 10) / 10;
      if (record.type === "estimated_1rm") point.oneRm = Math.round(record.value);
      recordDates.set(record.date, point);
    });
  const data = [...recordDates.values()]
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .map((point) => ({ ...point, label: formatDay(point.date) }));

  return (
    <ChartFrame
      copy={data.length ? "Carga maxima e 1RM estimado quando voce bate novos marcos." : "Registre treinos para criar a curva de forca."}
      title="Evolucao de forca"
      tall
    >
      <LineChart data={data}>
        <CartesianGrid stroke={chartTheme.stroke} vertical={false} />
        <XAxis dataKey="label" stroke={chartTheme.tick} />
        <YAxis stroke={chartTheme.tick} />
        <Tooltip contentStyle={{ background: "#242424", border: "1px solid rgba(255,255,255,.12)" }} />
        <Line connectNulls dataKey="oneRm" dot={{ fill: "#B7F34D" }} name="1RM" stroke="#B7F34D" strokeWidth={3} />
        <Line connectNulls dataKey="weight" dot={{ fill: "#78D8FF" }} name="Carga" stroke="#78D8FF" strokeWidth={2} />
      </LineChart>
    </ChartFrame>
  );
}

export function FrequencyChart({ sessions }: { sessions: WorkoutSession[] }) {
  const byWeek = new Map<string, { label: string; treinos: number }>();
  sessions.forEach((session) => {
    const week = startOfWeek(new Date(session.date));
    const key = week.toISOString();
    const current = byWeek.get(key) ?? { label: formatDay(key), treinos: 0 };
    current.treinos += 1;
    byWeek.set(key, current);
  });
  const data = [...byWeek.entries()]
    .sort(([left], [right]) => new Date(left).getTime() - new Date(right).getTime())
    .slice(-8)
    .map(([, point]) => point);

  return (
    <ChartFrame copy="Semanas treinadas mantem a consistencia visivel." title="Frequencia">
      <BarChart data={data}>
        <CartesianGrid stroke={chartTheme.stroke} vertical={false} />
        <XAxis dataKey="label" stroke={chartTheme.tick} />
        <YAxis allowDecimals={false} stroke={chartTheme.tick} />
        <Tooltip contentStyle={{ background: "#242424", border: "1px solid rgba(255,255,255,.12)" }} />
        <Bar dataKey="treinos" fill="#FF6B57" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartFrame>
  );
}

function ChartFrame({
  children,
  copy,
  title,
  tall,
}: {
  children: ReactElement;
  copy: string;
  title: string;
  tall?: boolean;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mb-5 mt-1 text-sm text-zinc-400">{copy}</p>
      <div className={tall ? "h-[22rem] min-w-0" : "h-64 min-w-0"}>
        <ResponsiveContainer height="100%" width="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
