import { motion } from "framer-motion";
import { Check, ChevronDown, GripVertical, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Toast } from "../../components/common/Toast";
import { exercises, muscleGroups } from "../../data/exercises";
import { planService } from "../../services/planService";
import { useAppStore } from "../../store/useAppStore";
import { useAuthStore } from "../../store/useAuthStore";
import type { Category, Exercise, WorkoutBlock, WorkoutPlan } from "../../types";
import { makeId } from "../../utils/id";
import { workoutLimitMessage } from "../../utils/validators/planValidator";

const colors = ["#B7F34D", "#FF6B57", "#78D8FF", "#F5B942", "#E28CFF"];

const categoryLabels: Record<Category, string> = {
  "membros inferiores": "Membros inferiores",
  "membros superiores": "Membros superiores",
};

export function PlanEditor({ plan, onClose }: { plan?: WorkoutPlan; onClose: () => void }) {
  const createPlan = useAppStore((state) => state.createPlan);
  const updatePlan = useAppStore((state) => state.updatePlan);
  const plans = useAppStore((state) => state.plans);
  const user = useAuthStore((state) => state.user);
  const baseBlock = plan?.blocks[0];
  const [title, setTitle] = useState(plan?.title ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [color, setColor] = useState(plan?.color ?? colors[0]);
  const [selectedIds, setSelectedIds] = useState(baseBlock?.exerciseIds ?? []);
  const [selectedGroups, setSelectedGroups] = useState(
    plan?.muscleGroups.length ? plan.muscleGroups : ["Peito"],
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedExercises = selectedIds
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const groupsByCategory = useMemo(
    () =>
      Object.entries(
        muscleGroups.reduce<Record<string, string[]>>((groups, group) => {
          const category = exercises.find((exercise) => exercise.muscleGroup === group)?.category;
          if (!category) return groups;
          groups[category] = [...(groups[category] ?? []), group];
          return groups;
        }, {}),
      ) as Array<[Category, string[]]>,
    [],
  );

  const savePlan = async () => {
    if (!title.trim() || selectedIds.length === 0) return;
    if (!plan && !planService.canCreateMoreWorkouts(user, plans.length)) {
      setNotice(user ? workoutLimitMessage(user.plan) : "Entre para criar fichas.");
      return;
    }
    const muscleGroupsFromSelection = [...new Set(selectedExercises.map((exercise) => exercise.muscleGroup))];
    const blocks: WorkoutBlock[] = [
      {
        id: baseBlock?.id ?? makeId("block"),
        color,
        exerciseIds: selectedIds,
      },
    ];
    const next = {
      title: title.trim(),
      description: description.trim(),
      color,
      muscleGroups: muscleGroupsFromSelection,
      blocks,
    };
    setIsSaving(true);
    try {
      const saved = plan ? await updatePlan({ ...plan, ...next }) : Boolean(await createPlan(next));
      if (!saved) {
        setNotice("Nao foi possivel salvar a ficha. Tente novamente.");
        return;
      }
      onClose();
    } catch {
      setNotice("Erro ao salvar a ficha. Verifique sua conexao.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGroup = (group: string) => {
    setSelectedGroups((groups) =>
      groups.includes(group) && groups.length > 1
        ? groups.filter((item) => item !== group)
        : groups.includes(group)
          ? groups
          : [...groups, group],
    );
  };

  const addExercise = (exercise: Exercise) => {
    if (selectedIds.includes(exercise.id)) return;
    setSelectedIds((ids) => [...ids, exercise.id]);
    setNotice(`${exercise.name} adicionado.`);
    window.setTimeout(() => setNotice(""), 1700);
  };

  const moveExercise = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const next = [...selectedIds];
    const [dragged] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, dragged);
    setSelectedIds(next);
    setDraggedIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid max-w-7xl gap-4 rounded-lg border border-white/10 bg-canvas p-4 shadow-lift md:p-6 xl:grid-cols-[.92fr_1.08fr]"
        initial={{ opacity: 0, y: 14 }}
      >
        <div className="min-w-0">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-lime">{plan ? "Editar ficha" : "Nova ficha"}</p>
              <h2 className="text-2xl font-semibold">Monte o treino</h2>
            </div>
            <Button aria-label="Fechar editor" onClick={onClose} size="icon" title="Fechar" variant="ghost">
              <X size={20} />
            </Button>
          </div>
          <div className="grid gap-3">
            <label className="grid gap-2 text-sm">
              Titulo
              <Input onChange={(event) => setTitle(event.target.value)} placeholder="Treino A" value={title} />
            </label>
            <label className="grid gap-2 text-sm">
              Descricao curta
              <Input
                maxLength={90}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: foco em peito e triceps"
                value={description}
              />
            </label>
            <ColorSwatches onChange={setColor} selected={color} />
          </div>
          <Card className="mt-4 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Exercicios da ficha</p>
                <p className="text-sm text-zinc-400">Arraste para ajustar a ordem.</p>
              </div>
              <Badge>{selectedIds.length}</Badge>
            </div>
            <div className="grid gap-2">
              {selectedExercises.map((exercise, index) => (
                <div
                  className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-2"
                  draggable
                  key={exercise.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={() => setDraggedIndex(index)}
                  onDrop={() => moveExercise(index)}
                >
                  <GripVertical className="text-zinc-500" size={18} />
                  <ExerciseThumb exercise={exercise} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{exercise.name}</p>
                    <p className="text-xs text-zinc-400">{exercise.muscleGroup}</p>
                  </div>
                  <Button
                    aria-label={`Remover ${exercise.name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedIds((ids) => ids.filter((id) => id !== exercise.id));
                    }}
                    size="icon"
                    title="Remover"
                    type="button"
                    variant="ghost"
                  >
                    <X size={17} />
                  </Button>
                </div>
              ))}
              {selectedIds.length === 0 ? (
                <p className="rounded-md border border-dashed border-white/15 p-4 text-sm text-zinc-400">
                  Selecione um grupo ao lado e adicione os primeiros exercicios.
                </p>
              ) : null}
            </div>
          </Card>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={onClose} variant="secondary">Cancelar</Button>
            <Button disabled={isSaving || !title.trim() || selectedIds.length === 0} onClick={savePlan} type="button">
              <Check size={18} />
              {isSaving ? "Salvando..." : "Salvar ficha"}
            </Button>
          </div>
        </div>
        <Card className="min-w-0 p-4">
          <div>
            <h3 className="text-lg font-semibold">Grupos musculares</h3>
            <p className="mt-1 text-sm text-zinc-400">A ficha mostra somente os grupos selecionados.</p>
          </div>
          <div className="mt-4 grid gap-3">
            {groupsByCategory.map(([category, groups]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">{categoryLabels[category]}</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {groups.map((group) => (
                    <button
                      className={`min-h-10 shrink-0 rounded-md border px-3 text-sm transition ${
                        selectedGroups.includes(group)
                          ? "border-lime/50 bg-lime/15 text-white"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                      key={group}
                      onClick={() => toggleGroup(group)}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid max-h-[68vh] gap-2 overflow-y-auto pr-1">
            {selectedGroups.map((group) => (
              <details className="group rounded-md border border-white/10 bg-white/5" key={group} open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3">
                  <span className="font-semibold">{group}</span>
                  <ChevronDown className="text-zinc-400 transition group-open:rotate-180" size={18} />
                </summary>
                <div className="grid gap-2 border-t border-white/10 p-2">
                  {exercises
                    .filter((exercise) => exercise.muscleGroup === group)
                    .map((exercise) => {
                      const added = selectedIds.includes(exercise.id);
                      return (
                        <div className="flex items-center gap-2 rounded-md bg-black/15 p-2" key={exercise.id}>
                          <ExerciseThumb exercise={exercise} />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{exercise.name}</p>
                            <p className="text-xs text-zinc-500">{exercise.equipment}</p>
                          </div>
                          <Button
                            aria-label={`Adicionar ${exercise.name}`}
                            disabled={added}
                            onClick={() => addExercise(exercise)}
                            size="icon"
                            title="Adicionar"
                            type="button"
                            variant={added ? "secondary" : "primary"}
                          >
                            {added ? <Check size={17} /> : <Plus size={17} />}
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </details>
            ))}
          </div>
        </Card>
      </motion.div>
      <Toast message={notice} />
    </div>
  );
}

function ExerciseThumb({ exercise }: { exercise: Exercise }) {
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-white/10 bg-white/[.04]">
      {exercise.gifUrl ? (
        <img
          alt={`Demonstracao de ${exercise.name}`}
          className="h-full w-full object-cover"
          loading="lazy"
          src={exercise.gifUrl}
        />
      ) : (
        <span className="text-xs font-black uppercase text-zinc-500">{exercise.muscleGroup.slice(0, 2)}</span>
      )}
    </div>
  );
}

function ColorSwatches({ selected, onChange }: { selected: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm">Cor da ficha</p>
      <div className="flex gap-2">
        {colors.map((value) => (
          <button
            aria-label={`Cor ${value}`}
            className="h-9 w-9 rounded-md border transition"
            key={value}
            onClick={() => onChange(value)}
            style={{ background: value, borderColor: selected === value ? "#fff" : "rgba(255,255,255,.12)" }}
            title={value}
          />
        ))}
      </div>
    </div>
  );
}
