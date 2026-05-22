import { motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Clock3,
  Plus,
  TimerReset,
  Trash2,
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
  notesOpen: boolean;
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
      notesOpen: false,
      sets: [emptySet()],
    })),
  );

const toNumber = (value: string) => (value === "" ? 0 : Number(value));

export default function Workout() {
  const plans = useAppStore((state) => state.plans);
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
          return (
            <Card className="overflow-hidden p-3 sm:p-4" key={entry.id}>
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{exercise?.name}</h3>
                  <p className="text-sm text-zinc-400">{exercise?.muscleGroup}</p>
                </div>
              </div>
              <div className="grid grid-cols-[2.5rem_minmax(4.5rem,1fr)_minmax(4.5rem,1fr)_3rem_2.5rem] items-center gap-1 border-b border-white/10 px-1 pb-1 text-[11px] font-semibold uppercase text-zinc-500 sm:grid-cols-[3rem_8rem_7rem_3rem_2.5rem]">
                <span>Set</span>
                <span>Kg</span>
                <span>Reps</span>
                <span className="text-center">Ok</span>
                <span />
              </div>
              <div className="grid">
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
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <Button
                  className="min-h-9 px-3 text-sm"
                  onClick={() =>
                    setDraft((entries) =>
                      entries.map((item) => (item.id === entry.id ? { ...item, sets: [...item.sets, emptySet()] } : item)),
                    )
                  }
                  variant="secondary"
                >
                  <Plus size={15} />
                  Serie
                </Button>
                <Button
                  className="min-h-9 px-3 text-sm"
                  onClick={() => setSeconds(toNumber(entry.sets.at(-1)?.rest ?? "90") || 90)}
                  variant="ghost"
                >
                  <Clock3 size={15} />
                  Descanso
                </Button>
                <Button
                  className="min-h-9 px-3 text-sm"
                  onClick={() =>
                    setDraft((entries) =>
                      entries.map((item) =>
                        item.id === entry.id ? { ...item, notesOpen: !item.notesOpen } : item,
                      ),
                    )
                  }
                  variant="ghost"
                >
                  {entry.notes ? "Editar nota" : "Adicionar nota"}
                </Button>
              </div>
              {entry.notesOpen ? (
                <motion.label
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-2 grid gap-1 overflow-hidden text-sm"
                  initial={{ height: 0, opacity: 0 }}
                >
                  Nota
                  <Textarea
                    autoFocus
                    className="min-h-16"
                    onChange={(event) =>
                      setDraft((entries) =>
                        entries.map((item) => (item.id === entry.id ? { ...item, notes: event.target.value } : item)),
                      )
                    }
                    placeholder="Tecnica ou ajuste da proxima sessao."
                    value={entry.notes}
                  />
                </motion.label>
              ) : null}
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
    <motion.div
      animate={{
        backgroundColor: set.completed ? "rgba(183,243,77,0.08)" : "rgba(255,255,255,0)",
        opacity: set.completed ? 0.58 : 1,
      }}
      className="grid grid-cols-[2.5rem_minmax(4.5rem,1fr)_minmax(4.5rem,1fr)_3rem_2.5rem] items-center gap-1 border-b border-white/5 px-1 py-1 last:border-b-0 sm:grid-cols-[3rem_8rem_7rem_3rem_2.5rem]"
      layout
    >
      <span className="text-sm font-semibold text-zinc-400">{index + 1}</span>
      <CompactNumberInput
        decimal
        label={`Carga da serie ${index + 1}`}
        onChange={(value) => onChange("weight", value)}
        placeholder="0"
        value={set.weight}
      />
      <CompactNumberInput
        label={`Repeticoes da serie ${index + 1}`}
        onChange={(value) => onChange("reps", value)}
        placeholder="0"
        value={set.reps}
      />
      <button
        aria-label={`${set.completed ? "Reabrir" : "Concluir"} serie ${index + 1}`}
        className={`grid h-10 w-10 place-items-center rounded-md transition ${
          set.completed ? "bg-lime text-zinc-950 shadow-[0_0_24px_rgba(183,243,77,.25)]" : "bg-white/10 text-zinc-300 hover:bg-white/15"
        }`}
        onClick={onComplete}
        title="Concluir serie"
      >
        <motion.span
          animate={{ scale: set.completed ? [0.7, 1.18, 1] : 1, rotate: set.completed ? [0, -8, 0] : 0 }}
          transition={{ duration: 0.28 }}
        >
          <Check size={17} strokeWidth={3} />
        </motion.span>
      </button>
      <Button
        aria-label={`Remover serie ${index + 1}`}
        className="h-10 min-h-10 w-10 text-zinc-500"
        disabled={!removable}
        onClick={onRemove}
        size="icon"
        title="Remover serie"
        variant="ghost"
      >
        <Trash2 size={15} />
      </Button>
    </motion.div>
  );
}

function CompactNumberInput({
  decimal,
  label,
  placeholder,
  value,
  onChange,
}: {
  decimal?: boolean;
  label: string;
  placeholder: string;
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
    return singleDecimal.replace(/^0+(?=\d)/, "");
  };

  return (
    <input
      aria-label={label}
      className="h-10 w-full rounded-md border border-transparent bg-black/20 px-2 text-center text-base font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-lime focus:bg-black/30"
      inputMode={decimal ? "decimal" : "numeric"}
      onChange={(event) => onChange(clean(event.target.value))}
      pattern={decimal ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
      placeholder={placeholder}
      value={value}
    />
  );
}
