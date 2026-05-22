import { Shield } from "lucide-react";
import { Card } from "../components/ui/card";

export default function AdminPlaceholder() {
  return (
    <div className="grid min-h-[calc(100vh-3rem)] place-items-center">
      <Card className="max-w-xl p-6 text-center sm:p-10">
        <Shield className="mx-auto text-lime" size={34} />
        <h2 className="mt-4 text-3xl font-bold">Administracao preparada</h2>
        <p className="mt-3 text-zinc-400">A rota admin existe para a proxima fase de permissoes e operacao.</p>
      </Card>
    </div>
  );
}

