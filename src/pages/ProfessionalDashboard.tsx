import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import type { AppView } from "../types";

export default function ProfessionalDashboard({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  return (
    <div className="grid min-h-[calc(100vh-3rem)] place-items-center">
      <Card className="max-w-2xl p-6 text-center sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-lime/15 text-lime">
          <BriefcaseBusiness size={28} />
        </div>
        <h2 className="mt-5 text-3xl font-bold">Painel Profissional</h2>
        <p className="mt-3 text-zinc-300">
          Em breve você poderá gerenciar alunos, enviar fichas e acompanhar evolução.
        </p>
        <Button className="mt-6" onClick={() => onNavigate("home")} variant="secondary">
          <ArrowLeft size={18} />
          Voltar ao app principal
        </Button>
      </Card>
    </div>
  );
}
