import { Building2 } from "lucide-react";
import { Card } from "../components/ui/card";

export default function ElitePlaceholder() {
  return (
    <Card className="mx-auto max-w-3xl p-6">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-md bg-lime text-zinc-950">
        <Building2 size={24} />
      </div>
      <p className="text-sm font-semibold uppercase text-lime">LIFTO ELITE</p>
      <h1 className="mt-2 text-3xl font-semibold">Painel institucional</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">
        Em breve este espaco vai reunir unidades, instrutores, distribuicao de alunos, permissoes avancadas e analytics
        institucionais.
      </p>
    </Card>
  );
}
