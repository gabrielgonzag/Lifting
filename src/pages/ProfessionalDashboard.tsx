import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clipboard,
  Copy,
  Dumbbell,
  Mail,
  MessageSquare,
  Plus,
  Save,
  Send,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input, Textarea } from "../components/ui/input";
import { coachService } from "../services/coachService";
import { coachTrainingService } from "../services/coachTrainingService";
import { inviteService } from "../services/inviteService";
import { sharedWorkoutService } from "../services/sharedWorkoutService";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute, CoachNote, CoachWorkspace, SharedWorkoutExercise, SharedWorkoutPlan, StudentDashboard } from "../types";
import { makeId } from "../utils/id";

const dateLabel = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value))
    : "Sem treino";

const currencyless = (value: number) => new Intl.NumberFormat("pt-BR").format(value);

const routeParts = (route: AppRoute) => {
  const parts = route.split("/");
  const studentId = parts[1] === "students" ? parts[2] : undefined;
  const section = parts[3];
  return { studentId, section };
};

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-lime/10 text-lime">
          <Icon size={19} />
        </span>
      </div>
    </Card>
  );
}

function PanelNav({ route, onNavigate }: { route: AppRoute; onNavigate: (route: AppRoute) => void }) {
  const itemClass = (active: boolean) =>
    `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
      active ? "bg-lime text-zinc-950" : "text-zinc-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="grid gap-2 border-b border-white/10 pb-4 lg:border-b-0 lg:border-r lg:pr-4">
      <button className={itemClass(route === "coach")} onClick={() => onNavigate("coach")}>
        <BarChart3 size={17} />
        Visao geral
      </button>
      <button className={itemClass(route.startsWith("coach/students"))} onClick={() => onNavigate("coach/students")}>
        <Users size={17} />
        Meus Alunos
      </button>
      <button className={itemClass(route === "coach/invites")} onClick={() => onNavigate("coach/invites")}>
        <UserPlus size={17} />
        Convites
      </button>
      <button className="mt-2 flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-zinc-400 transition hover:bg-white/10 hover:text-white" onClick={() => onNavigate("home")}>
        <ArrowLeft size={17} />
        App principal
      </button>
    </aside>
  );
}

function StudentCard({ coachId, student, onNavigate }: { coachId: string; student: StudentDashboard; onNavigate: (route: AppRoute) => void }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-white/10 text-sm font-bold text-lime">
              {student.student.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">{student.student.name}</h3>
              <p className="text-sm text-zinc-400">{student.student.email}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{student.relation.status}</Badge>
            <Badge variant="muted">{student.recentFrequency}</Badge>
            <Badge variant="muted">{student.lastWorkoutLabel}</Badge>
          </div>
          <p className="mt-4 text-sm text-zinc-300">{student.progressSummary}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button onClick={() => onNavigate(`coach/students/${student.student.id}`)} variant="secondary">
            Ver aluno
          </Button>
          <Button onClick={() => onNavigate(`coach/students/${student.student.id}/workouts`)} variant="ghost">
            Editar ficha
          </Button>
          <Button
            onClick={() => {
              coachTrainingService.startStudentWorkout(coachId, student.student.id, student.student.name);
              onNavigate("workout");
            }}
            variant="ghost"
          >
            Iniciar treino
          </Button>
          <Button onClick={() => onNavigate(`coach/students/${student.student.id}`)} variant="ghost">
            Enviar observacao
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ProgressCharts({ student }: { student: StudentDashboard }) {
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
              <Line dataKey="load" stroke="#a3ff12" strokeWidth={3} dot={false} />
              <Line dataKey="personalRecord" stroke="#38bdf8" strokeWidth={2} dot={false} />
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

function WorkoutEditor({
  coachId,
  plans,
  onChange,
}: {
  coachId: string;
  plans: SharedWorkoutPlan[];
  onChange: () => void;
}) {
  const [selectedId, setSelectedId] = useState(plans[0]?.id ?? "");
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];
  const [newExerciseName, setNewExerciseName] = useState("");

  const save = (plan: SharedWorkoutPlan) => {
    sharedWorkoutService.updateWorkout({ ...plan, lastEditedBy: coachId });
    onChange();
  };

  const updateExercise = (exerciseId: string, patch: Partial<SharedWorkoutExercise>) => {
    if (!selected) return;
    save({
      ...selected,
      exercises: selected.exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, ...patch } : exercise)),
    });
  };

  const moveExercise = (exerciseId: string, direction: -1 | 1) => {
    if (!selected) return;
    const exercises = [...selected.exercises].sort((a, b) => a.order - b.order);
    const index = exercises.findIndex((exercise) => exercise.id === exerciseId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= exercises.length) return;
    [exercises[index], exercises[nextIndex]] = [exercises[nextIndex], exercises[index]];
    save({ ...selected, exercises: exercises.map((exercise, order) => ({ ...exercise, order: order + 1 })) });
  };

  if (!selected) return <Card className="p-5 text-zinc-400">Nenhuma ficha vinculada.</Card>;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {plans.map((plan) => (
          <Button key={plan.id} onClick={() => setSelectedId(plan.id)} variant={selected.id === plan.id ? "primary" : "secondary"}>
            {plan.title}
          </Button>
        ))}
        <Button
          onClick={() => {
            sharedWorkoutService.duplicateWorkout(coachId, selected.id);
            onChange();
          }}
          variant="ghost"
        >
          <Copy size={16} />
          Duplicar ficha
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
          <Input value={selected.title} onChange={(event) => save({ ...selected, title: event.target.value })} />
          <Input value={selected.description} onChange={(event) => save({ ...selected, description: event.target.value })} />
          <Button onClick={() => save(selected)}>
            <Save size={16} />
            Salvar
          </Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {selected.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((exercise) => (
            <Card key={exercise.id} className="p-4">
              <div className="grid gap-3 xl:grid-cols-[1.4fr_.5fr_.6fr_.7fr_.6fr_1.2fr_auto]">
                <LabeledField label="Exercicio">
                  <Input value={exercise.name} onChange={(event) => updateExercise(exercise.id, { name: event.target.value })} />
                </LabeledField>
                <LabeledField label="Series">
                  <Input min={1} type="number" value={exercise.sets} onChange={(event) => updateExercise(exercise.id, { sets: Number(event.target.value) })} />
                </LabeledField>
                <LabeledField label="Repeticoes">
                  <Input value={exercise.reps} onChange={(event) => updateExercise(exercise.id, { reps: event.target.value })} />
                </LabeledField>
                <LabeledField label="Peso">
                  <Input min={0} type="number" value={exercise.suggestedLoad} onChange={(event) => updateExercise(exercise.id, { suggestedLoad: Number(event.target.value) })} />
                </LabeledField>
                <LabeledField label="Descanso">
                  <Input min={0} type="number" value={exercise.restSeconds} onChange={(event) => updateExercise(exercise.id, { restSeconds: Number(event.target.value) })} />
                </LabeledField>
                <LabeledField label="Observacao">
                  <Input placeholder="Observacao" value={exercise.notes ?? ""} onChange={(event) => updateExercise(exercise.id, { notes: event.target.value })} />
                </LabeledField>
                <div className="flex gap-2">
                  <Button onClick={() => moveExercise(exercise.id, -1)} size="icon" variant="ghost">↑</Button>
                  <Button onClick={() => moveExercise(exercise.id, 1)} size="icon" variant="ghost">↓</Button>
                  <Button onClick={() => save({ ...selected, exercises: selected.exercises.filter((item) => item.id !== exercise.id) })} size="icon" variant="danger">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input placeholder="Novo exercicio" value={newExerciseName} onChange={(event) => setNewExerciseName(event.target.value)} />
          <Button
            onClick={() => {
              if (!newExerciseName.trim()) return;
              save({
                ...selected,
                exercises: [
                  ...selected.exercises,
                  {
                    id: makeId("exercise"),
                    exerciseId: makeId("custom"),
                    name: newExerciseName.trim(),
                    order: selected.exercises.length + 1,
                    sets: 3,
                    reps: "8-10",
                    suggestedLoad: 0,
                    restSeconds: 90,
                  },
                ],
              });
              setNewExerciseName("");
            }}
          >
            <Plus size={16} />
            Adicionar exercicio
          </Button>
        </div>
      </Card>
    </div>
  );
}

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-semibold uppercase text-zinc-500">
      {label}
      {children}
    </label>
  );
}

function NotesPanel({ coachId, studentId, notes, onChange }: { coachId: string; studentId: string; notes: CoachNote[]; onChange: () => void }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<CoachNote["type"]>("general");
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState("");

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="grid gap-3">
          <select className="min-h-11 rounded-md border border-white/10 bg-black/20 px-3 text-white outline-none" value={type} onChange={(event) => setType(event.target.value as CoachNote["type"])}>
            <option value="general">Geral</option>
            <option value="workout">Ficha</option>
            <option value="exercise">Exercicio</option>
            <option value="progression">Progressao</option>
          </select>
          <Textarea placeholder="Escreva uma observacao para o aluno..." value={content} onChange={(event) => setContent(event.target.value)} />
          <Button
            onClick={() => {
              if (!content.trim()) return;
              sharedWorkoutService.saveNote({ coachId, studentId, type, content: content.trim() });
              setContent("");
              onChange();
            }}
          >
            <Send size={16} />
            Enviar observacao
          </Button>
        </div>
      </Card>
      {notes.map((note) => (
        <Card key={note.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Badge variant="muted">{note.type}</Badge>
              {editingId === note.id ? (
                <div className="mt-3 grid gap-3">
                  <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
                  <Button
                    onClick={() => {
                      sharedWorkoutService.saveNote({ ...note, content: draft });
                      setEditingId("");
                      setDraft("");
                      onChange();
                    }}
                  >
                    <Save size={16} />
                    Salvar observacao
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-200">{note.content}</p>
              )}
              <p className="mt-2 text-xs text-zinc-500">Atualizado em {dateLabel(note.updatedAt)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingId(note.id);
                  setDraft(note.content);
                }}
                size="icon"
                variant="ghost"
              >
                <MessageSquare size={16} />
              </Button>
              <Button
                onClick={() => {
                  sharedWorkoutService.deleteNote(note.id);
                  onChange();
                }}
                size="icon"
                variant="danger"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function InvitePanel({ coachId, workspace, refresh }: { coachId: string; workspace: CoachWorkspace; refresh: () => void }) {
  const [inviteTarget, setInviteTarget] = useState("");
  const [copied, setCopied] = useState("");

  const create = () => {
    if (!inviteTarget.trim()) return;
    inviteService.createInvite(coachId, inviteTarget.trim());
    setInviteTarget("");
    refresh();
  };

  return (
    <div className="grid gap-5">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <Input placeholder="Email, ID ou username do aluno" value={inviteTarget} onChange={(event) => setInviteTarget(event.target.value)} />
          <Button onClick={create}>
            <UserPlus size={17} />
            Enviar convite
          </Button>
          <Button onClick={create} variant="secondary">
            <Clipboard size={17} />
            Gerar link
          </Button>
        </div>
        <p className="mt-3 text-sm text-zinc-400">Link externo pronto para WhatsApp, Instagram, email ou copia manual. Envio real sera plugado na camada de integracao futura.</p>
      </Card>
      <div className="grid gap-3">
        {workspace.invites.map((invite) => (
          <Card key={invite.id} className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{invite.status}</Badge>
                  <span className="font-bold text-white">{invite.studentEmail ?? invite.studentId ?? "Link externo"}</span>
                </div>
                <p className="mt-2 break-all text-sm text-zinc-400">{invite.inviteLink}</p>
                <p className="mt-1 text-xs text-zinc-500">Expira em {dateLabel(invite.expiresAt)}</p>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard?.writeText(invite.inviteLink);
                  setCopied(invite.id);
                }}
                variant="secondary"
              >
                <Copy size={16} />
                {copied === invite.id ? "Copiado" : "Copiar link"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StudentDetail({
  coachId,
  student,
  workouts,
  notes,
  route,
  refresh,
  onNavigate,
}: {
  coachId: string;
  student: StudentDashboard;
  workouts: SharedWorkoutPlan[];
  notes: CoachNote[];
  route: AppRoute;
  refresh: () => void;
  onNavigate: (route: AppRoute) => void;
}) {
  const section = routeParts(route).section;
  const showWorkouts = section === "workouts";
  const showProgress = section === "progress";
  const best = student.progress.at(-1);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button className="mb-4 text-sm font-semibold text-zinc-400 hover:text-white" onClick={() => onNavigate("coach/students")}>
            ← Voltar para alunos
          </button>
          <h1 className="text-3xl font-bold text-white">{student.student.name}</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">{student.student.goal}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              coachTrainingService.startStudentWorkout(coachId, student.student.id, student.student.name);
              onNavigate("workout");
            }}
          >
            <Dumbbell size={17} />
            Iniciar treino
          </Button>
          <Button onClick={() => onNavigate(`coach/students/${student.student.id}`)} variant={!showWorkouts && !showProgress ? "primary" : "secondary"}>Resumo</Button>
          <Button onClick={() => onNavigate(`coach/students/${student.student.id}/workouts`)} variant={showWorkouts ? "primary" : "secondary"}>Fichas</Button>
          <Button onClick={() => onNavigate(`coach/students/${student.student.id}/progress`)} variant={showProgress ? "primary" : "secondary"}>Historico</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Mail} label="Email" value={student.student.email.split("@")[0]} />
        <Metric icon={Activity} label="Frequencia" value={student.recentFrequency} />
        <Metric icon={Dumbbell} label="Ultimo treino" value={dateLabel(student.student.lastWorkoutAt)} />
        <Metric icon={BarChart3} label="Melhor evolucao" value={best ? `+${best.personalRecord - student.progress[0].personalRecord} kg` : "0 kg"} />
      </div>

      {showWorkouts ? (
        <WorkoutEditor coachId={coachId} plans={workouts} onChange={refresh} />
      ) : showProgress ? (
        <div className="grid gap-5">
          <ProgressCharts student={student} />
          <Card className="p-4">
            <h3 className="font-bold text-white">Historico de treinos</h3>
            <div className="mt-4 grid gap-2">
              {student.history.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[.03] p-3">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-zinc-500">{dateLabel(item.date)} · {item.durationMinutes} min · {item.completedExercises} exercicios</p>
                  </div>
                  <Badge variant="muted">{currencyless(item.volume)} kg volume</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div className="grid gap-5">
            <ProgressCharts student={student} />
            <Card className="p-4">
              <h3 className="font-bold text-white">Fichas vinculadas</h3>
              <div className="mt-4 grid gap-3">
                {workouts.map((plan) => (
                  <div key={plan.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[.03] p-3">
                    <div>
                      <p className="font-semibold text-white">{plan.title}</p>
                      <p className="text-sm text-zinc-500">{plan.exercises.length} exercicios · editada {dateLabel(plan.updatedAt)}</p>
                    </div>
                    <Button onClick={() => onNavigate(`coach/students/${student.student.id}/workouts`)} variant="secondary">Editar ficha</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="grid gap-5 content-start">
            <Card className="p-4">
              <h3 className="font-bold text-white">Indicadores</h3>
              <div className="mt-4 grid gap-3 text-sm text-zinc-300">
                <p>Melhor exercicio em evolucao: <span className="font-semibold text-white">{best?.exerciseName}</span></p>
                <p>Semanas consistentes: <span className="font-semibold text-white">3 de 4</span></p>
                <p>Ultima atualizacao do personal: <span className="font-semibold text-white">{dateLabel(workouts[0]?.updatedAt)}</span></p>
              </div>
            </Card>
            <NotesPanel coachId={coachId} studentId={student.student.id} notes={notes} onChange={refresh} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfessionalDashboard({ onNavigate, route }: { onNavigate: (route: AppRoute) => void; route: AppRoute }) {
  const user = useAuthStore((state) => state.user);
  const coachId = user?.id ?? "coach-demo";
  const [workspace, setWorkspace] = useState<CoachWorkspace>(() => coachService.loadWorkspace(coachId));
  const { studentId } = routeParts(route);
  const selectedStudent = useMemo(() => workspace.students.find((item) => item.student.id === studentId), [studentId, workspace.students]);
  const refresh = () => setWorkspace(coachService.loadWorkspace(coachId));
  const activeRoute = route === "professional" ? "coach" : route;

  const totalWorkouts = workspace.students.reduce((sum, item) => sum + item.history.length, 0);
  const activeStudents = workspace.students.filter((item) => item.relation.status === "active").length;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[220px_1fr]">
      <PanelNav onNavigate={onNavigate} route={activeRoute} />
      <main className="min-w-0">
        {!selectedStudent && activeRoute !== "coach/invites" ? (
          <div className="grid gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-lime">Workspace profissional</p>
                <h1 className="mt-2 text-3xl font-bold text-white">Meus Alunos</h1>
                <p className="mt-2 max-w-2xl text-zinc-400">Gestao de alunos, fichas, frequencia, evolucao e convites em um ambiente preparado para sincronizacao real.</p>
              </div>
              <Button onClick={() => onNavigate("coach/invites")}>
                <UserPlus size={17} />
                Convidar aluno
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Metric icon={Users} label="Alunos ativos" value={String(activeStudents)} />
              <Metric icon={Activity} label="Treinos recentes" value={String(totalWorkouts)} />
              <Metric icon={MessageSquare} label="Observacoes" value={String(workspace.notes.length)} />
            </div>
            <div className="grid gap-3">
              {workspace.students.map((student) => (
                <StudentCard coachId={coachId} key={student.student.id} student={student} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ) : activeRoute === "coach/invites" ? (
          <div className="grid gap-5">
            <div>
              <p className="text-sm font-bold uppercase text-lime">Convites</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Convidar aluno</h1>
              <p className="mt-2 max-w-2xl text-zinc-400">Gere links, convites por email ou por ID. O aceite cria o vinculo coach/aluno quando o backend real for conectado.</p>
            </div>
            <InvitePanel coachId={coachId} refresh={refresh} workspace={workspace} />
          </div>
        ) : selectedStudent ? (
          <StudentDetail
            coachId={coachId}
            notes={workspace.notes.filter((note) => note.studentId === selectedStudent.student.id)}
            onNavigate={onNavigate}
            refresh={refresh}
            route={activeRoute}
            student={selectedStudent}
            workouts={workspace.sharedWorkouts.filter((plan) => plan.studentId === selectedStudent.student.id)}
          />
        ) : null}
      </main>
    </div>
  );
}
