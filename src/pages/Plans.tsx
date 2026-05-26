import { useMemo, useState } from "react";
import { Icon } from "../components/ui/Icon";
import { useToast } from "../components/ui/Toast";
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
  const toast = useToast();
  const [editorPlan, setEditorPlan] = useState<WorkoutPlan | "new" | null>(null);
  const [query, setQuery] = useState("");
  const groups = [...new Set(plans.flatMap((plan) => plan.muscleGroups))];
  const [group, setGroup] = useState("Todos");
  const filteredPlans = useMemo(
    () =>
      plans.filter(
        (plan) =>
          plan.title.toLowerCase().includes(query.toLowerCase()) &&
          (group === "Todos" || plan.muscleGroups.includes(group)),
      ),
    [group, plans, query],
  );
  const canCreate = planService.canCreateMoreWorkouts(user, plans.length);
  const createBlockedMessage = user ? workoutLimitMessage(user.plan) : "Entre para criar fichas.";

  const openNewPlan = () => {
    if (!canCreate) {
      toast({ kind: "error", msg: createBlockedMessage });
      return;
    }
    setEditorPlan("new");
  };

  const duplicate = async (id: string) => {
    if (!canCreate) {
      toast({ kind: "error", msg: createBlockedMessage });
      return;
    }
    try {
      const duplicated = await duplicatePlan(id);
      toast({ kind: duplicated ? "ok" : "error", msg: duplicated ? "Ficha duplicada." : "Nao foi possivel duplicar a ficha." });
    } catch {
      toast({ kind: "error", msg: "Nao foi possivel duplicar a ficha." });
    }
  };

  return (
    <div className="min-h-full overflow-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-6 pb-24 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label">Biblioteca pessoal</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em]">Fichas</h1>
            <p className="mt-2 text-sm text-[var(--fg-3)]">Suas rotinas, organizadas para entrar no treino rapido.</p>
          </div>
          <button className="btn btn-primary" onClick={openNewPlan}>
            <Icon name="plus" size={16} stroke={2.2} />
            Criar ficha
          </button>
        </header>

        <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
          <label className="relative">
            <Icon className="pointer-events-none absolute left-3 top-3.5 text-[var(--fg-3)]" name="search" size={16} />
            <Input className="input pl-10" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ficha" value={query} />
          </label>
          <select className="input" onChange={(event) => setGroup(event.target.value)} value={group}>
            <option>Todos</option>
            {groups.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="card card-pad">
            <div className="grid justify-items-center gap-4 py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--lime)]">
                <Icon name="sparkles" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Sua proxima rotina comeca aqui.</h2>
                <p className="mt-2 max-w-sm text-sm text-[var(--fg-3)]">Monte uma ficha por grupo muscular e treine com foco.</p>
              </div>
              <button className="btn btn-primary" onClick={openNewPlan}>
                <Icon name="plus" size={16} />
                Criar ficha
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlans.map((plan, index) => (
              <FichaCard
                delay={index * 40}
                key={plan.id}
                onDelete={async () => {
                  try {
                    const deleted = await deletePlan(plan.id);
                    toast({ kind: deleted ? "ok" : "error", msg: deleted ? "Ficha excluida." : "Nao foi possivel excluir a ficha." });
                  } catch {
                    toast({ kind: "error", msg: "Nao foi possivel excluir a ficha." });
                  }
                }}
                onDuplicate={() => duplicate(plan.id)}
                onOpen={() => setEditorPlan(plan)}
                onTrain={() => {
                  window.location.hash = "workout";
                }}
                plan={plan}
              />
            ))}
          </div>
        )}
      </div>

      {editorPlan ? (
        <PlanEditor onClose={() => setEditorPlan(null)} plan={editorPlan === "new" ? undefined : editorPlan} />
      ) : null}
    </div>
  );
}

function FichaCard({
  delay,
  onDelete,
  onDuplicate,
  onOpen,
  onTrain,
  plan,
}: {
  delay: number;
  onDelete: () => void;
  onDuplicate: () => void;
  onOpen: () => void;
  onTrain: () => void;
  plan: WorkoutPlan;
}) {
  const exerciseCount = plan.blocks.flatMap((block) => block.exerciseIds).length;
  return (
    <article
      className="anim-rise group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--border-hi)] hover:bg-[var(--card-hi)]"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: plan.color }} />
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-40 blur-3xl transition group-hover:opacity-70" style={{ background: plan.color }} />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="badge"><Icon name="clock" size={10} />{new Date(plan.updatedAt).toLocaleDateString("pt-BR")}</span>
          <div className="flex gap-1">
            <button aria-label="Editar ficha" className="btn btn-ghost btn-sm btn-icon text-[var(--fg-3)]" onClick={onOpen}>
              <Icon name="edit" size={14} />
            </button>
            <button aria-label="Duplicar ficha" className="btn btn-ghost btn-sm btn-icon text-[var(--fg-3)]" onClick={onDuplicate}>
              <Icon name="plus" size={14} />
            </button>
            <button aria-label="Excluir ficha" className="btn btn-ghost btn-sm btn-icon text-[var(--coral)]" onClick={onDelete}>
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>
        <h2 className="text-xl font-bold tracking-[-0.02em]">{plan.title}</h2>
        <p className="mt-2 min-h-10 text-sm text-[var(--fg-3)]">{plan.description || "Sem descricao."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {plan.muscleGroups.slice(0, 4).map((group) => <span className="badge" key={group}>{group}</span>)}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--fg-3)]">{exerciseCount} exercicios</span>
          <button className="btn btn-sm" onClick={onTrain} style={{ background: plan.color, color: "#0a0a0a", fontWeight: 700 }}>
            <Icon name="play" size={11} stroke={0} />
            Treinar agora
          </button>
        </div>
      </div>
    </article>
  );
}
