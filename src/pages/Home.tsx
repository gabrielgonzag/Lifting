import { motion } from "framer-motion";
import { ArrowRight, Dumbbell, NotebookPen, Plus } from "lucide-react";
import hero from "../assets/gym-notebook-hero.png";
import { SectionTitle } from "../components/common/SectionTitle";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { exercises } from "../data/exercises";
import { useAppStore } from "../store/useAppStore";
import type { AppView } from "../types";
import { formatLongDate, inCurrentWeek } from "../utils/format";

export default function Home({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  const plans = useAppStore((state) => state.plans);
  const sessions = useAppStore((state) => state.sessions);
  const weeklySessions = sessions.filter((session) => inCurrentWeek(session.date));
  const lastSession = sessions[0];
  const lastPlan = plans.find((plan) => plan.id === lastSession?.workoutPlanId);

  return (
    <div className="grid gap-6">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[21rem] overflow-hidden rounded-lg border border-white/10"
        initial={{ opacity: 0, y: 14 }}
      >
        <img alt="Equipamentos e bloco de treino em academia" className="absolute inset-0 h-full w-full object-cover" src={hero} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,24,24,.94),rgba(24,24,24,.58),rgba(24,24,24,.24))]" />
        <div className="relative flex min-h-[21rem] max-w-2xl flex-col justify-end p-5 sm:p-8">
          <Badge className="w-fit border-lime/30 bg-lime/15 text-lime">CONTENT.ENV</Badge>
          <h2 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">Escolha a ficha e treine.</h2>
          <p className="mt-3 max-w-xl text-zinc-200">
            Monte fichas, grave series e acompanhe a carga sem sair do fluxo da academia.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => onNavigate("plans")}>
              <NotebookPen size={18} />
              Criar ficha
            </Button>
            <Button onClick={() => onNavigate("workout")} variant="secondary">
              <Dumbbell size={18} />
              Iniciar treino
            </Button>
          </div>
        </div>
      </motion.section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div>
          <SectionTitle
            action={
              <Button onClick={() => onNavigate("plans")} variant="secondary">
                <Plus size={17} />
                Nova ficha
              </Button>
            }
            copy={`${weeklySessions.length} treino${weeklySessions.length === 1 ? "" : "s"} nesta semana.`}
            title="Suas fichas"
          />
          <div className="grid gap-3 md:grid-cols-2">
            {plans.slice(0, 6).map((plan) => (
              <Card className="p-4" key={plan.id}>
                <div className="mb-4 h-1.5 rounded-full" style={{ background: plan.color }} />
                <h3 className="text-xl font-semibold">{plan.title}</h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-zinc-400">{plan.description}</p>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lime" onClick={() => onNavigate("plans")}>
                  Abrir ficha <ArrowRight size={16} />
                </button>
              </Card>
            ))}
            {plans.length === 0 ? (
              <Card className="grid min-h-48 place-items-center border-dashed p-5 text-center">
                <div>
                  <h3 className="text-lg font-semibold">Crie sua primeira ficha</h3>
                  <p className="mt-2 text-sm text-zinc-400">Escolha grupos musculares e deixe o treino pronto para abrir.</p>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
        <div>
          <SectionTitle copy="Ultimo treino salvo no navegador." title="Resumo rapido" />
          <Card className="p-5">
            {lastSession ? (
              <>
                <Badge>{lastPlan?.title ?? "Ficha removida"}</Badge>
                <h3 className="mt-4 text-2xl font-semibold">{formatLongDate(lastSession.date)}</h3>
                <p className="mt-2 text-zinc-400">{lastSession.exercises.length} exercicios registrados.</p>
                <div className="mt-5 grid gap-2">
                  {lastSession.exercises.slice(0, 3).map((entry) => {
                    const exercise = exercises.find((item) => item.id === entry.exerciseId);
                    return (
                      <div className="flex items-center justify-between rounded-md bg-white/5 p-3" key={entry.id}>
                        <span>{exercise?.name ?? "Exercicio"}</span>
                        <Badge>{entry.sets.length} series</Badge>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-zinc-400">Finalize um treino para ver seu historico aqui.</p>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
