import { motion } from "framer-motion";
import {
  ArrowDownUp,
  Check,
  Dumbbell,
  GripVertical,
  Heart,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { equipmentOptions, exercises, muscleGroups } from "../../data/exercises";
import { useAppStore } from "../../store/useAppStore";
import type { WorkoutBlock, WorkoutPlan } from "../../types";
import { makeId } from "../../utils/id";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input, Textarea } from "../../components/ui/input";

const colors = ["#B7F34D", "#FF6B57", "#78D8FF", "#F5B942", "#E28CFF"];
const icons = ["bolt", "flame", "mountain", "target", "pulse"];

export function PlanEditor({
  plan,
  onClose,
}: {
  plan?: WorkoutPlan;
  onClose: () => void;
}) {
  const createPlan = useAppStore((state) => state.createPlan);
  const updatePlan = useAppStore((state) => state.updatePlan);
  const favoriteIds = useAppStore((state) => state.favoriteExerciseIds);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const baseBlock = plan?.blocks[0];
  const [title, setTitle] = useState(plan?.title ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [color, setColor] = useState(plan?.color ?? colors[0]);
  const [icon, setIcon] = useState(plan?.icon ?? icons[0]);
  const [blockTitle, setBlockTitle] = useState(baseBlock?.title ?? "Bloco principal");
  const [blockColor, setBlockColor] = useState(baseBlock?.color ?? colors[1]);
  const [selectedIds, setSelectedIds] = useState(baseBlock?.exerciseIds ?? []);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("Todos");
  const [equipment, setEquipment] = useState("Todos");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const filteredExercises = useMemo(
    () =>
      exercises.filter((exercise) => {
        const matchesQuery = exercise.name.toLowerCase().includes(query.toLowerCase());
        return (
          matchesQuery &&
          (muscle === "Todos" || exercise.muscleGroup === muscle) &&
          (equipment === "Todos" || exercise.equipment === equipment)
        );
      }),
    [equipment, muscle, query],
  );

  const selectedExercises = selectedIds
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter(Boolean);
  const selectedMuscles = [...new Set(selectedExercises.map((exercise) => exercise!.muscleGroup))];

  const savePlan = () => {
    if (!title.trim() || selectedIds.length === 0) return;
    const blocks: WorkoutBlock[] = [
      {
        id: baseBlock?.id ?? makeId("block"),
        title: blockTitle.trim() || "Bloco principal",
        color: blockColor,
        exerciseIds: selectedIds,
      },
    ];
    const next = {
      title: title.trim(),
      description: description.trim(),
      color,
      icon,
      muscleGroups: selectedMuscles,
      blocks,
    };
    if (plan) {
      updatePlan({ ...plan, ...next });
    } else {
      createPlan(next);
    }
    onClose();
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid max-w-7xl gap-4 rounded-lg border border-white/10 bg-canvas p-4 shadow-lift md:p-6 xl:grid-cols-[1.05fr_.95fr]"
        initial={{ opacity: 0, y: 16 }}
      >
        <div>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-lime">{plan ? "Editar ficha" : "Nova ficha"}</p>
              <h2 className="text-2xl font-semibold">Montagem do treino</h2>
            </div>
            <Button aria-label="Fechar editor" onClick={onClose} size="icon" title="Fechar" variant="ghost">
              <X size={20} />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Titulo
              <Input onChange={(event) => setTitle(event.target.value)} placeholder="Treino A" value={title} />
            </label>
            <label className="grid gap-2 text-sm">
              Icone
              <select
                className="min-h-11 rounded-md border border-white/10 bg-black/20 px-3"
                onChange={(event) => setIcon(event.target.value)}
                value={icon}
              >
                {icons.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 grid gap-2 text-sm">
            Descricao
            <Textarea
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Objetivo, cadencia ou observacoes da ficha."
              value={description}
            />
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ColorSwatches label="Cor da ficha" onChange={setColor} selected={color} />
            <ColorSwatches label="Cor do bloco" onChange={setBlockColor} selected={blockColor} />
          </div>
          <label className="mt-4 grid gap-2 text-sm">
            Titulo do bloco
            <Input onChange={(event) => setBlockTitle(event.target.value)} value={blockTitle} />
          </label>
          <Card className="mt-4 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Ordem dos exercicios</p>
                <p className="text-sm text-zinc-400">Arraste para reordenar a execucao.</p>
              </div>
              <Badge>
                <ArrowDownUp className="mr-1" size={13} />
                {selectedIds.length}
              </Badge>
            </div>
            <div className="grid gap-2">
              {selectedExercises.map((exercise, index) => (
                <div
                  className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-2"
                  draggable
                  key={exercise!.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={() => setDraggedIndex(index)}
                  onDrop={() => moveExercise(index)}
                >
                  <GripVertical className="text-zinc-500" size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{exercise!.name}</p>
                    <p className="text-xs text-zinc-400">{exercise!.muscleGroup}</p>
                  </div>
                  <Button
                    aria-label={`Remover ${exercise!.name}`}
                    onClick={() => setSelectedIds(selectedIds.filter((id) => id !== exercise!.id))}
                    size="icon"
                    title="Remover"
                    variant="ghost"
                  >
                    <X size={17} />
                  </Button>
                </div>
              ))}
              {selectedIds.length === 0 ? (
                <p className="rounded-md border border-dashed border-white/15 p-4 text-sm text-zinc-400">
                  Adicione exercicios da biblioteca para salvar a ficha.
                </p>
              ) : null}
            </div>
          </Card>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button disabled={!title.trim() || selectedIds.length === 0} onClick={savePlan}>
              <Check size={18} />
              Salvar ficha
            </Button>
          </div>
        </div>
        <Card className="min-h-0 p-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-lime" size={18} />
            <h3 className="text-lg font-semibold">Biblioteca de exercicios</h3>
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_12rem_12rem]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-zinc-500" size={18} />
              <Input className="pl-10" onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar" value={query} />
            </label>
            <select
              className="min-h-11 rounded-md border border-white/10 bg-black/20 px-3"
              onChange={(event) => setMuscle(event.target.value)}
              value={muscle}
            >
              <option>Todos</option>
              {muscleGroups.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              className="min-h-11 rounded-md border border-white/10 bg-black/20 px-3"
              onChange={(event) => setEquipment(event.target.value)}
              value={equipment}
            >
              <option>Todos</option>
              {equipmentOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid max-h-[68vh] gap-2 overflow-y-auto pr-1">
            {filteredExercises.map((exercise) => {
              const added = selectedIds.includes(exercise.id);
              const favorite = favoriteIds.includes(exercise.id);
              return (
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-2" key={exercise.id}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-xs text-zinc-400">
                      {exercise.muscleGroup} | {exercise.equipment}
                    </p>
                  </div>
                  <Button
                    aria-label={`Favoritar ${exercise.name}`}
                    className={favorite ? "text-coral" : undefined}
                    onClick={() => toggleFavorite(exercise.id)}
                    size="icon"
                    title="Favoritar"
                    variant="ghost"
                  >
                    <Heart fill={favorite ? "currentColor" : "none"} size={17} />
                  </Button>
                  <Button
                    aria-label={`Adicionar ${exercise.name}`}
                    disabled={added}
                    onClick={() => setSelectedIds([...selectedIds, exercise.id])}
                    size="icon"
                    title="Adicionar"
                    variant={added ? "secondary" : "primary"}
                  >
                    {added ? <Check size={17} /> : <Plus size={17} />}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ColorSwatches({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm">{label}</p>
      <div className="flex gap-2">
        {colors.map((value) => (
          <button
            aria-label={`${label} ${value}`}
            className="h-9 w-9 rounded-md border transition"
            key={value}
            onClick={() => onChange(value)}
            style={{
              background: value,
              borderColor: selected === value ? "#fff" : "rgba(255,255,255,.12)",
            }}
            title={value}
          />
        ))}
      </div>
    </div>
  );
}
