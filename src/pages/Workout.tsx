import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Minus, Plus, TimerReset, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { SectionTitle } from "../components/common/SectionTitle";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input, Textarea } from "../components/ui/input";
import { exercises } from "../data/exercises";
import { useAppStore } from "../store/useAppStore";
import type { WorkoutExercise, WorkoutPlan, WorkoutSession } from "../types";
import { makeId } from "../utils/id";

const buildDraft = (plan: WorkoutPlan): WorkoutExercise[] =>
  plan.blocks.flatMap((block) =>
    block.exerciseIds.map((exerciseId) => ({
      id: makeId("entry"),
      exerciseId,
      sets: [{ id: makeId("set"), weight: 0, reps: 0, rest: 90 }],
      notes: "",
    })),
  );

export default function Workout() {
  const plans = useAppStore((state) => state.plans);
  const sessions = useAppStore((state) => state.sessions);
  const saveSession = useAppStore((state) => state.saveSession);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const selectedPlan = plans.find((plan) => plan.id === planId);
  const [draft, setDraft] = useState<WorkoutExercise[]>(selectedPlan ? buildDraft(selectedPlan) : []);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState<WorkoutSession | null>(null);

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

  const previousMax = useMemo(() => {
    const maxByExercise = new Map<string, number>();
    sessions.forEach((session) =>
      session.exercises.forEach((entry) =>
        entry.sets.forEach((set) =>
          maxByExercise.set(entry.exerciseId, Math.max(maxByExercise.get(entry.exerciseId) ?? 0, set.weight)),
        ),
      ),
    );
    return maxByExercise;
  }, [sessions]);

  const updateSet = (entryId: string, setId: string, field: "weight" | "reps" | "rpe" | "rest", value: number) =>
    setDraft((entries) =>
      entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, sets: entry.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)) }
          : entry,
      ),
    );

  const finishWorkout = () => {
    if (!selectedPlan) return;
    const session: WorkoutSession = {
      id: makeId("session"),
      workoutPlanId: selectedPlan.id,
      date: new Date().toISOString(),
      exercises: draft.map((entry) => ({
        ...entry,
        sets: entry.sets
          .filter((set) => set.reps > 0)
          .map((set) => ({
            ...set,
            isPersonalRecord: set.weight > (previousMax.get(entry.exerciseId) ?? 0),
          })),
      })).filter((entry) => entry.sets.length > 0),
    };
    if (session.exercises.length === 0) return;
    saveSession(session);
    setFinished(session);
  };

  if (plans.length === 0) {
    return <EmptyState description="Crie uma ficha antes de registrar series." icon={<Plus />} title="Sem fichas" />;
  }

  return (
    <div>
      <SectionTitle copy="Registre carga, repeticoes, RPE, descanso e observacoes." title="Treino" />
      <Card className="mb-4 grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm">
          Ficha ativa
          <select className="min-h-11 rounded-md border border-white/10 bg-black/20 px-3" onChange={(event) => setPlanId(event.target.value)} value={planId}>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.title}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <Badge className="min-h-11 gap-2 px-3">
            <Clock3 size={16} />
            Descanso {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </Badge>
          <Button onClick={() => setSeconds(90)} variant="secondary">
            <TimerReset size={18} />
            90s
          </Button>
        </div>
      </Card>
      {finished ? (
        <motion.div animate={{ scale: 1, opacity: 1 }} initial={{ scale: 0.98, opacity: 0 }}>
          <Card className="mb-4 border-lime/30 bg-lime/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-lime" />
              <div>
                <p className="font-semibold">Treino finalizado</p>
                <p className="text-sm text-zinc-300">{finished.exercises.length} exercicios salvos no historico local.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}
      <div className="grid gap-4">
        {draft.map((entry) => {
          const exercise = exercises.find((item) => item.id === entry.exerciseId);
          return (
            <Card className="p-4" key={entry.id}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{exercise?.name}</h3>
                  <p className="text-sm text-zinc-400">{exercise?.muscleGroup} | {exercise?.equipment}</p>
                </div>
                <Badge>{entry.sets.length} series</Badge>
              </div>
              <div className="grid gap-2">
                {entry.sets.map((set, index) => (
                  <div className="grid gap-2 rounded-md bg-white/5 p-3 md:grid-cols-[auto_repeat(4,minmax(0,1fr))_auto]" key={set.id}>
                    <Badge className="h-11 justify-center">S{index + 1}</Badge>
                    <NumberField label="kg" onChange={(value) => updateSet(entry.id, set.id, "weight", value)} value={set.weight} />
                    <NumberField label="reps" onChange={(value) => updateSet(entry.id, set.id, "reps", value)} value={set.reps} />
                    <NumberField label="RPE" onChange={(value) => updateSet(entry.id, set.id, "rpe", value)} value={set.rpe ?? 0} />
                    <NumberField label="desc." onChange={(value) => updateSet(entry.id, set.id, "rest", value)} value={set.rest ?? 0} />
                    <Button
                      aria-label="Remover serie"
                      disabled={entry.sets.length === 1}
                      onClick={() =>
                        setDraft((entries) =>
                          entries.map((item) =>
                            item.id === entry.id ? { ...item, sets: item.sets.filter((itemSet) => itemSet.id !== set.id) } : item,
                          ),
                        )
                      }
                      size="icon"
                      title="Remover serie"
                      variant="ghost"
                    >
                      <Minus size={17} />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    setDraft((entries) =>
                      entries.map((item) =>
                        item.id === entry.id
                          ? { ...item, sets: [...item.sets, { id: makeId("set"), weight: 0, reps: 0, rest: 90 }] }
                          : item,
                      ),
                    )
                  }
                  variant="secondary"
                >
                  <Plus size={17} />
                  Adicionar serie
                </Button>
                <Button onClick={() => setSeconds(entry.sets.at(-1)?.rest ?? 90)} variant="ghost">
                  <Clock3 size={17} />
                  Iniciar descanso
                </Button>
                {(previousMax.get(entry.exerciseId) ?? 0) > 0 ? (
                  <Badge className="gap-1">
                    <Trophy size={14} />
                    PR atual {previousMax.get(entry.exerciseId)} kg
                  </Badge>
                ) : null}
              </div>
              <label className="mt-3 grid gap-2 text-sm">
                Observacoes
                <Textarea
                  onChange={(event) =>
                    setDraft((entries) =>
                      entries.map((item) => (item.id === entry.id ? { ...item, notes: event.target.value } : item)),
                    )
                  }
                  placeholder="Amplitude, dor, tecnica ou ajuste da proxima sessao."
                  value={entry.notes ?? ""}
                />
              </label>
            </Card>
          );
        })}
      </div>
      <div className="sticky bottom-20 z-20 mt-4 flex justify-end lg:bottom-4">
        <Button className="shadow-lift" onClick={finishWorkout}>
          <CheckCircle2 size={18} />
          Finalizar treino
        </Button>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-1 text-xs text-zinc-400">
      {label}
      <Input min={0} onChange={(event) => onChange(Number(event.target.value))} type="number" value={value} />
    </label>
  );
}
