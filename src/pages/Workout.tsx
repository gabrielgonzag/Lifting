import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Plus,
  TimerReset,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { SectionTitle } from "../components/common/SectionTitle";
import { Toast } from "../components/common/Toast";
import { WorkoutSetRow, type WorkoutDraftSet } from "../components/workout/WorkoutSetRow";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/input";
import { exercises } from "../data/exercises";
import { coachTrainingService } from "../services/coachTrainingService";
import { useAppStore } from "../store/useAppStore";
import type { CoachTrainingContext, SharedWorkoutPlan, WorkoutPlan, WorkoutSession } from "../types";
import { makeId } from "../utils/id";

type DraftExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  coachExerciseId?: string;
  notes: string;
  notesOpen: boolean;
  sets: WorkoutDraftSet[];
};

const emptySet = (): WorkoutDraftSet => ({
  id: makeId("set"),
  weight: "",
  reps: "",
  isPr: false,
  prType: "weight",
  rest: "90",
  completed: false,
});

const buildDraft = (plan: WorkoutPlan): DraftExercise[] =>
  plan.blocks.flatMap((block) =>
    block.exerciseIds.map((exerciseId) => {
      const exercise = exercises.find((item) => item.id === exerciseId);
      return {
        id: makeId("entry"),
        exerciseId,
        exerciseName: exercise?.name ?? "Exercicio",
        notes: "",
        notesOpen: false,
        sets: [emptySet()],
      };
    }),
  );

const buildCoachDraft = (plan: SharedWorkoutPlan): DraftExercise[] =>
  plan.exercises
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((exercise) => ({
      id: makeId("entry"),
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.name,
      coachExerciseId: exercise.id,
      notes: exercise.notes ?? "",
      notesOpen: false,
      sets: Array.from({ length: Math.max(1, exercise.sets) }, () => ({
        ...emptySet(),
        weight: exercise.suggestedLoad ? String(exercise.suggestedLoad) : "",
        reps: exercise.reps.match(/\d+/)?.[0] ?? "",
        rest: String(exercise.restSeconds || 90),
      })),
    }));

const toNumber = (value: string) => (value === "" ? 0 : Number(value));

export default function Workout() {
  const plans = useAppStore((state) => state.plans);
  const saveSession = useAppStore((state) => state.saveSession);
  const [coachContext, setCoachContext] = useState<CoachTrainingContext | null>(() => coachTrainingService.getActiveContext());
  const coachPlans = coachContext ? coachTrainingService.listActiveStudentPlans(coachContext) : [];
  const isCoachSession = Boolean(coachContext);
  const [planId, setPlanId] = useState(coachPlans[0]?.id ?? plans[0]?.id ?? "");
  const selectedPlan = plans.find((plan) => plan.id === planId);
  const selectedCoachPlan = coachPlans.find((plan) => plan.id === planId);
  const [draft, setDraft] = useState<DraftExercise[]>(
    selectedCoachPlan ? buildCoachDraft(selectedCoachPlan) : selectedPlan ? buildDraft(selectedPlan) : [],
  );
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState<Omit<WorkoutSession, "userId" | "createdAt" | "updatedAt"> | null>(null);
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedCoachPlan) {
      setDraft(buildCoachDraft(selectedCoachPlan));
      setFinished(null);
      return;
    }
    if (!selectedPlan) return;
    setDraft(buildDraft(selectedPlan));
    setFinished(null);
  }, [planId, selectedCoachPlan?.updatedAt]);

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

  const syncCoachChange = (entry: DraftExercise, field: keyof WorkoutDraftSet, value: string | boolean, nextSetCount?: number) => {
    if (!coachContext || !selectedCoachPlan || !entry.coachExerciseId || typeof value === "boolean") return;
    if (field === "weight") coachTrainingService.updateLoad(selectedCoachPlan, entry.coachExerciseId, toNumber(value));
    if (field === "reps") coachTrainingService.updateRepetitions(selectedCoachPlan, entry.coachExerciseId, value);
    if (field === "rest") coachTrainingService.updateRest(selectedCoachPlan, entry.coachExerciseId, toNumber(value) || 90);
    if (nextSetCount) coachTrainingService.updateSeries(selectedCoachPlan, entry.coachExerciseId, nextSetCount);
  };

  const updateSet = (entryId: string, setId: string, field: keyof WorkoutDraftSet, value: string | boolean) =>
    setDraft((entries) => {
      const source = entries.find((entry) => entry.id === entryId);
      if (source) syncCoachChange(source, field, value);
      return entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, sets: entry.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)) }
          : entry,
      );
    });

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1900);
  };

  const finishWorkout = async () => {
    if (isSaving) return;
    if (!selectedPlan && !selectedCoachPlan) return;
    const session: Omit<WorkoutSession, "userId" | "createdAt" | "updatedAt"> = {
      id: makeId("session"),
      workoutPlanId: selectedCoachPlan?.id ?? selectedPlan!.id,
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
              isPr: set.isPr,
              prType: set.prType,
              rest: toNumber(set.rest) || undefined,
              completed: true,
            })),
        }))
        .filter((entry) => entry.sets.length > 0),
    };
    if (session.exercises.length === 0) {
      toast("Preencha carga e repeticoes antes de salvar.");
      return;
    }
    setIsSaving(true);
    try {
      const records =
        coachContext && selectedCoachPlan
          ? Number(coachTrainingService.completeWorkout({ context: coachContext, plan: selectedCoachPlan, session }).ok)
          : await saveSession(session);
      setFinished(session);
      toast(isCoachSession ? "Treino do aluno sincronizado." : records ? `${records} novo${records === 1 ? "" : "s"} PR${records === 1 ? "" : "s"} detectado${records === 1 ? "" : "s"}.` : "Treino salvo.");
    } catch {
      toast("Erro ao salvar treino. Verifique sua conexao.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isCoachSession && plans.length === 0) {
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
      {coachContext ? (
        <Card className="mb-4 border-lime/25 bg-lime/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-lime">Treino acompanhado pelo coach</p>
              <p className="mt-1 font-semibold text-white">{coachContext.studentName}</p>
              <p className="text-sm text-zinc-400">Series, repeticoes, carga e descanso atualizam a ficha compartilhada e a evolucao do aluno.</p>
            </div>
            <Button
              onClick={() => {
                coachTrainingService.clearActiveContext();
                setCoachContext(null);
                setPlanId(plans[0]?.id ?? "");
              }}
              variant="secondary"
            >
              Encerrar modo coach
            </Button>
          </div>
        </Card>
      ) : null}
      <Card className="mb-4 grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm">
          Ficha ativa
          <select
            className="min-h-12 rounded-md border border-white/10 bg-black/20 px-3"
            onChange={(event) => setPlanId(event.target.value)}
            value={planId}
          >
            {(isCoachSession ? coachPlans : plans).map((plan) => (
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
                  <h3 className="text-lg font-semibold">{entry.exerciseName}</h3>
                  <p className="text-sm text-zinc-400">{exercise?.muscleGroup ?? "Ficha do aluno"}</p>
                </div>
              </div>
              <div className="grid grid-cols-[2rem_minmax(4rem,1fr)_minmax(4rem,1fr)_4.25rem_2.75rem_2.25rem] items-center gap-1 border-b border-white/10 px-1 pb-1 text-[11px] font-semibold uppercase text-zinc-500 sm:grid-cols-[3rem_7rem_6rem_4.75rem_3rem_2.5rem]">
                <span>Serie</span>
                <span>Peso</span>
                <span>Repeticoes</span>
                <span>PR</span>
                <span className="text-center">Ok</span>
                <span />
              </div>
              <div className="grid">
                {entry.sets.map((set, index) => (
                  <WorkoutSetRow
                    key={set.id}
                    index={index}
                    onChange={(field, value) => updateSet(entry.id, set.id, field, value)}
                    onComplete={() => {
                      updateSet(entry.id, set.id, "completed", !set.completed);
                      if (!set.completed) toast("Serie concluida.");
                    }}
                    onRemove={() =>
                      setDraft((entries) => {
                        syncCoachChange(entry, "reps", entry.sets.at(-1)?.reps ?? "", Math.max(1, entry.sets.length - 1));
                        return entries.map((item) =>
                          item.id === entry.id ? { ...item, sets: item.sets.filter((itemSet) => itemSet.id !== set.id) } : item,
                        );
                      })
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
                    setDraft((entries) => {
                      syncCoachChange(entry, "reps", entry.sets.at(-1)?.reps ?? "", entry.sets.length + 1);
                      return entries.map((item) => (item.id === entry.id ? { ...item, sets: [...item.sets, emptySet()] } : item));
                    })
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
        <Button disabled={isSaving} onClick={finishWorkout} type="button">
          <CheckCircle2 size={18} />
          {isSaving ? "Salvando..." : "Finalizar"}
        </Button>
      </div>
      <Toast message={notice} />
    </div>
  );
}
