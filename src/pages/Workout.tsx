import { motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Clock3,
  Minus,
  Plus,
  TimerReset,
  Trash2,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { SectionTitle } from "../components/common/SectionTitle";
import { Toast } from "../components/common/Toast";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/input";
import { exercises } from "../data/exercises";
import { useAppStore } from "../store/useAppStore";
import type { WorkoutPlan, WorkoutSession } from "../types";
import { makeId } from "../utils/id";
import { bestRecord, estimatedOneRepMax } from "../utils/records";

type DraftSet = {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
  rest: string;
  completed: boolean;
};

type DraftExercise = {
  id: string;
  exerciseId: string;
  notes: string;
  sets: DraftSet[];
};

const emptySet = (): DraftSet => ({
  id: makeId("set"),
  weight: "",
  reps: "",
  rpe: "",
  rest: "90",
  completed: false,
});

const buildDraft = (plan: WorkoutPlan): DraftExercise[] =>
  plan.blocks.flatMap((block) =>
    block.exerciseIds.map((exerciseId) => ({
      id: makeId("entry"),
      exerciseId,
      notes: "",
      sets: [emptySet()],
    })),
  );

const toNumber = (value: string) => (value === "" ? 0 : Number(value));

export default function Workout() {
  const plans = useAppStore((state) => state.plans);
  const personalRecords = useAppStore((state) => state.personalRecords);
  const saveSession = useAppStore((state) => state.saveSession);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const selectedPlan = plans.find((plan) => plan.id === planId);
  const [draft, setDraft] = useState<DraftExercise[]>(selectedPlan ? buildDraft(selectedPlan) : []);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState<WorkoutSession | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!selectedPlan) return;
    setDraft(buildDraft(selectedPlan));
    setFinished(null);
  }, [planId]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const validSetCount = useMemo(
    () =>
      draft.reduce(
        (total, entry) =>
          total + entry.sets.filter((set) => toNumber(set.weight) > 0 && toNumber(set.reps) > 0).length,
        0,
      ),
    [draft],
  );

  const updateSet = (entryId: string, setId: string, field: keyof DraftSet, value: string | boolean) =>
    setDraft((entries) =>
      entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, sets: entry.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)) }
          : entry,
      ),
    );

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1900);
  };

  const finishWorkout = () => {
    if (!selectedPlan) return;
    const session: WorkoutSession = {
      id: makeId("session"),
      workoutPlanId: selectedPlan.id,
      date: new Date().toISOString(),
      exercises: draft
        .map((entry) => ({
          id: entry.id,
          exerciseId: entry.exerciseId,
          notes: entry.notes,
          sets: entry.sets
            .filter((set) => toNumber(set.weight) > 0 && toNumber(set.reps) > 0)
            .map((set) => ({
              id: set.id,
              weight: toNumber(set.weight),
              reps: toNumber(set.reps),
              rpe: toNumber(set.rpe) || undefined,
              rest: toNumber(set.rest) || undefined,
              completed: set.completed,
            })),
        }))
        .filter((entry) => entry.sets.length > 0),
    };
    if (session.exercises.length === 0) {
      toast("Preencha carga e repeticoes antes de salvar.");
      return;
    }
    const records = saveSession(session);
    setFinished(session);
    toast(records ? `${records} novo${records === 1 ? "" : "s"} PR${records === 1 ? "" : "s"} detectado${records === 1 ? "" : "s"}.` : "Treino salvo.");
  };

  if (plans.length === 0) {
    return (
      <EmptyState
        description="Crie sua primeira ficha para comecar a registrar carga e repeticoes."
        icon={<Plus />}
        title="Nenhuma ficha pronta"
      />
    );
  }

  return (
    <div>
      <SectionTitle copy="Registre cada serie sem sair do ritmo." title="Treino" />
      <Card className="mb-4 grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm">
          Ficha ativa
          <select
            className="min-h-12 rounded-md border border-white/10 bg-black/20 px-3"
            onChange={(event) => setPlanId(event.target.value)}
            value={planId}
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>{plan.title}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <Badge className="min-h-12 gap-2 px-3 text-sm">
            <Clock3 size={16} />
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </Badge>
          <Button onClick={() => setSeconds(90)} variant="secondary">
            <TimerReset size={18} />
            90s
          </Button>
        </div>
      </Card>
      {finished ? (
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 8 }}>
          <Card className="mb-4 border-lime/30 bg-lime/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-lime" />
              <div>
                <p className="font-semibold">Treino salvo</p>
                <p className="text-sm text-zinc-300">{finished.exercises.length} exercicios no historico.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}
      <div className="grid gap-4">
        {draft.map((entry) => {
          const exercise = exercises.find((item) => item.id === entry.exerciseId);
          const weightRecord = bestRecord(personalRecords, entry.exerciseId, "absolute_weight");
          const oneRmRecord = bestRecord(personalRecords, entry.exerciseId, "estimated_1rm");
          return (
            <Card className="overflow-hidden p-4" key={entry.id}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{exercise?.name}</h3>
                  <p className="text-sm text-zinc-400">{exercise?.muscleGroup}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {weightRecord ? <Badge>PR {Math.round(weightRecord.value * 10) / 10} kg</Badge> : null}
                  {oneRmRecord ? <Badge>1RM {Math.round(oneRmRecord.value)} kg</Badge> : null}
                </div>
              </div>
              <div className="grid gap-2">
                {entry.sets.map((set, index) => (
                  <SetRow
                    key={set.id}
                    index={index}
                    onChange={(field, value) => updateSet(entry.id, set.id, field, value)}
                    onComplete={() => {
                      updateSet(entry.id, set.id, "completed", !set.completed);
                      if (!set.completed) toast("Serie concluida.");
                    }}
                    onRemove={() =>
                      setDraft((entries) =>
                        entries.map((item) =>
                          item.id === entry.id ? { ...item, sets: item.sets.filter((itemSet) => itemSet.id !== set.id) } : item,
                        ),
                      )
                    }
                    removable={entry.sets.length > 1}
                    set={set}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  onClick={() =>
                    setDraft((entries) =>
                      entries.map((item) => (item.id === entry.id ? { ...item, sets: [...item.sets, emptySet()] } : item)),
                    )
                  }
                  variant="secondary"
                >
                  <Plus size={17} />
                  Serie
                </Button>
                <Button onClick={() => setSeconds(toNumber(entry.sets.at(-1)?.rest ?? "90") || 90)} variant="ghost">
                  <Clock3 size={17} />
                  Descanso
                </Button>
                <Badge className="gap-1">
                  <Trophy size={14} />
                  {previewOneRm(entry.sets)}
                </Badge>
              </div>
              <label className="mt-3 grid gap-2 text-sm">
                Nota
                <Textarea
                  className="min-h-16"
                  onChange={(event) =>
                    setDraft((entries) =>
                      entries.map((item) => (item.id === entry.id ? { ...item, notes: event.target.value } : item)),
                    )
                  }
                  placeholder="Tecnica ou ajuste da proxima sessao."
                  value={entry.notes}
                />
              </label>
            </Card>
          );
        })}
      </div>
      <div className="sticky bottom-20 z-20 mt-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-panel/95 p-3 shadow-lift backdrop-blur lg:bottom-4">
        <p className="text-sm text-zinc-400">{validSetCount} serie{validSetCount === 1 ? "" : "s"} pronta{validSetCount === 1 ? "" : "s"}</p>
        <Button onClick={finishWorkout}>
          <CheckCircle2 size={18} />
          Finalizar
        </Button>
      </div>
      <Toast message={notice} />
    </div>
  );
}

function SetRow({
  index,
  set,
  removable,
  onChange,
  onComplete,
  onRemove,
}: {
  index: number;
  set: DraftSet;
  removable: boolean;
  onChange: (field: keyof DraftSet, value: string | boolean) => void;
  onComplete: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`rounded-md border p-2 ${set.completed ? "border-lime/35 bg-lime/10" : "border-white/10 bg-white/5"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge className="min-h-9">Serie {index + 1}</Badge>
        <div className="flex gap-1">
          <Button aria-label={`Concluir serie ${index + 1}`} onClick={onComplete} size="icon" title="Concluir serie" variant={set.completed ? "primary" : "secondary"}>
            <Check size={17} />
          </Button>
          <Button aria-label={`Remover serie ${index + 1}`} disabled={!removable} onClick={onRemove} size="icon" title="Remover serie" variant="ghost">
            <Trash2 size={17} />
          </Button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <NumberStepper decimal label="Carga" onChange={(value) => onChange("weight", value)} quickStep={2.5} suffix="kg" value={set.weight} />
        <NumberStepper label="Reps" onChange={(value) => onChange("reps", value)} quickStep={1} value={set.reps} />
        <NumberStepper label="RPE" max={10} onChange={(value) => onChange("rpe", value)} quickStep={1} value={set.rpe} />
        <NumberStepper label="Descanso" onChange={(value) => onChange("rest", value)} quickStep={15} suffix="s" value={set.rest} />
      </div>
    </div>
  );
}

function NumberStepper({
  decimal,
  label,
  max,
  quickStep,
  suffix,
  value,
  onChange,
}: {
  decimal?: boolean;
  label: string;
  max?: number;
  quickStep: number;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const clean = (raw: string) => {
    const normalized = raw.replace(",", ".").replace(decimal ? /[^0-9.]/g : /\D/g, "");
    const singleDecimal = decimal
      ? normalized.replace(/(\..*)\./g, "$1")
      : normalized;
    if (singleDecimal === "") return "";
    const next = Number(singleDecimal);
    if (!Number.isFinite(next) || next < 0) return "";
    return max ? String(Math.min(next, max)) : singleDecimal.replace(/^0+(?=\d)/, "");
  };
  const nudge = (delta: number) => {
    const next = Math.max(0, Math.min(max ?? Number.POSITIVE_INFINITY, (toNumber(value) || 0) + delta));
    onChange(next === 0 ? "" : String(Math.round(next * 100) / 100));
  };

  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-400">
      {label}
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-1">
        <Button aria-label={`Diminuir ${label}`} onClick={() => nudge(-quickStep)} size="icon" title={`Diminuir ${label}`} variant="ghost">
          <Minus size={16} />
        </Button>
        <div className="relative">
          <input
            aria-label={label}
            className="min-h-12 w-full rounded-md border border-white/10 bg-black/25 px-3 pr-9 text-center text-lg font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-lime"
            inputMode={decimal ? "decimal" : "numeric"}
            onChange={(event) => onChange(clean(event.target.value))}
            pattern={decimal ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
            placeholder="0"
            value={value}
          />
          {suffix ? <span className="pointer-events-none absolute right-2 top-4 text-xs text-zinc-500">{suffix}</span> : null}
        </div>
        <Button aria-label={`Aumentar ${label}`} onClick={() => nudge(quickStep)} size="icon" title={`Aumentar ${label}`} variant="secondary">
          <Plus size={16} />
        </Button>
      </div>
    </label>
  );
}

function previewOneRm(sets: DraftSet[]) {
  const next = Math.max(...sets.map((set) => estimatedOneRepMax(toNumber(set.weight), toNumber(set.reps))), 0);
  return next ? `1RM da serie ${Math.round(next)} kg` : "1RM aparece ao preencher";
}
