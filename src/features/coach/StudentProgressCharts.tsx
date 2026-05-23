import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import type { StudentDashboard } from "../../types";

export default function StudentProgressCharts({ student }: { student: StudentDashboard }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">Frequencia semanal</h3>
          <Badge variant="muted">meta {student.student.frequencyGoal}x</Badge>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={student.frequency}>
              <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
              <XAxis dataKey="label" stroke="#71717a" tickLine={false} />
              <YAxis stroke="#71717a" tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8 }} />
              <Bar dataKey="workouts" fill="#a3ff12" radius={[6, 6, 0, 0]} />
              <Bar dataKey="target" fill="rgba(255,255,255,.16)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">Carga e PR</h3>
          <Badge variant="muted">{student.progress[0]?.exerciseName}</Badge>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={student.progress}>
              <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
              <XAxis dataKey="label" stroke="#71717a" tickLine={false} />
              <YAxis stroke="#71717a" tickLine={false} width={34} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8 }} />
              <Line dataKey="load" dot={false} stroke="#a3ff12" strokeWidth={3} />
              <Line dataKey="personalRecord" dot={false} stroke="#38bdf8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4 xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">Volume mensal</h3>
          <Badge variant="muted">evolucao acumulada</Badge>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={student.progress}>
              <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
              <XAxis dataKey="label" stroke="#71717a" tickLine={false} />
              <YAxis stroke="#71717a" tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8 }} />
              <Area dataKey="volume" fill="rgba(163,255,18,.18)" stroke="#a3ff12" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
