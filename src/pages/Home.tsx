import { ArrowRight, Dumbbell, Plus } from "lucide-react";
import { SectionTitle } from "../components/common/SectionTitle";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAppStore } from "../store/useAppStore";
import type { AppView } from "../types";

export default function Home({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  const plans = useAppStore((state) => state.plans);

  return (
    <div className="grid gap-6">
      <SectionTitle
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onNavigate("plans")}>
              <Plus size={17} />
              Nova ficha
            </Button>
            <Button onClick={() => onNavigate("workout")} variant="secondary">
              <Dumbbell size={17} />
              Treinar
            </Button>
          </div>
        }
        copy="Abra uma ficha ou crie a proxima rotina."
        title="Suas fichas"
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <Card className="p-4" key={plan.id}>
            <div className="mb-4 h-1.5 rounded-full" style={{ background: plan.color }} />
            <h2 className="text-xl font-semibold">{plan.title}</h2>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm text-zinc-400">{plan.description || "Sem descricao."}</p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lime" onClick={() => onNavigate("plans")}>
              Abrir ficha <ArrowRight size={16} />
            </button>
          </Card>
        ))}
        {plans.length === 0 ? (
          <Card className="grid min-h-56 place-items-center border-dashed p-5 text-center">
            <div>
              <h2 className="text-lg font-semibold">Crie sua primeira ficha</h2>
              <p className="mt-2 max-w-sm text-sm text-zinc-400">
                Escolha grupos musculares e deixe o treino pronto para registrar.
              </p>
            </div>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
