import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { SectionTitle } from "../components/common/SectionTitle";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { PlanEditor } from "../features/workoutPlans/PlanEditor";
import { planService } from "../services/planService";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import type { WorkoutPlan } from "../types";
import { workoutLimitMessage } from "../utils/validators/planValidator";

export default function Plans() {
  const plans = useAppStore((state) => state.plans);
  const duplicatePlan = useAppStore((state) => state.duplicatePlan);
  const deletePlan = useAppStore((state) => state.deletePlan);
  const user = useAuthStore((state) => state.user);
  const [editorPlan, setEditorPlan] = useState<WorkoutPlan | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updated");
  const [group, setGroup] = useState("Todos");
  const groups = [...new Set(plans.flatMap((plan) => plan.muscleGroups))];
  const filteredPlans = useMemo(() => {
    const filtered = plans.filter(
      (plan) =>
        plan.title.toLowerCase().includes(query.toLowerCase()) &&
        (group === "Todos" || plan.muscleGroups.includes(group)),
    );
    return [...filtered].sort((left, right) =>
      sort === "name"
        ? left.title.localeCompare(right.title)
        : new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }, [group, plans, query, sort]);
  const canCreate = planService.canCreateMoreWorkouts(user, plans.length);
  const createBlockedMessage = user ? workoutLimitMessage(user.plan) : "Entre para criar fichas.";

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const openNewPlan = () => {
    if (!canCreate) {
      showNotice(createBlockedMessage);
      return;
    }
    setEditorPlan("new");
  };

  const duplicate = (id: string) => {
    if (!canCreate) {
      showNotice(createBlockedMessage);
      return;
    }
    duplicatePlan(id);
  };

  return (
    <>
      <SectionTitle
        action={
          <Button onClick={openNewPlan}>
            <Plus size={18} />
            Criar ficha
          </Button>
        }
        copy="Busque, organize e personalize suas rotinas."
        title="Fichas"
      />
      <div className="mb-4 grid gap-2 md:grid-cols-[1fr_13rem_12rem]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 text-zinc-500" size={18} />
          <Input className="pl-10" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ficha" value={query} />
        </label>
        <select className="min-h-11 rounded-md border border-white/10 bg-black/20 px-3" onChange={(event) => setGroup(event.target.value)} value={group}>
          <option>Todos</option>
          {groups.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className="min-h-11 rounded-md border border-white/10 bg-black/20 px-3" onChange={(event) => setSort(event.target.value)} value={sort}>
          <option value="updated">Atualizadas</option>
          <option value="name">Nome</option>
        </select>
      </div>
      {filteredPlans.length === 0 ? (
        <EmptyState
          action={<Button onClick={openNewPlan}>Nova ficha</Button>}
          description="Monte um bloco com exercicios, cores e observacoes do jeito que voce treina."
          icon={<Plus />}
          title="Nenhuma ficha encontrada"
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredPlans.map((plan) => (
            <Card className="p-4" key={plan.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-3 h-2 w-24 rounded-full" style={{ background: plan.color }} />
                  <h3 className="text-2xl font-semibold">{plan.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{plan.description || "Sem descricao."}</p>
                </div>
                <div className="flex gap-1">
                  <Button aria-label="Editar ficha" onClick={() => setEditorPlan(plan)} size="icon" title="Editar" variant="ghost">
                    <Pencil size={17} />
                  </Button>
                  <Button aria-label="Duplicar ficha" onClick={() => duplicate(plan.id)} size="icon" title="Duplicar" variant="ghost">
                    <Copy size={17} />
                  </Button>
                  <Button aria-label="Excluir ficha" onClick={() => deletePlan(plan.id)} size="icon" title="Excluir" variant="danger">
                    <Trash2 size={17} />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.muscleGroups.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
                <Badge>{plan.blocks.flatMap((block) => block.exerciseIds).length} exercicios</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      {editorPlan ? (
        <PlanEditor onClose={() => setEditorPlan(null)} plan={editorPlan === "new" ? undefined : editorPlan} />
      ) : null}
      {notice ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-md border border-lime/20 bg-zinc-950 px-4 py-3 text-sm text-lime shadow-lift">
          {notice}
        </div>
      ) : null}
    </>
  );
}
