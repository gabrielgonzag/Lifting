import { Download, Palette, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { SectionTitle } from "../components/common/SectionTitle";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAppStore } from "../store/useAppStore";
import type { AppSnapshot } from "../types";

export default function Settings() {
  const store = useAppStore();
  const [message, setMessage] = useState("Backup local pronto.");
  const inputRef = useRef<HTMLInputElement>(null);
  const accents = ["#B7F34D", "#FF6B57", "#78D8FF", "#F5B942"];

  const exportData = () => {
    const payload = JSON.stringify(
      {
        plans: store.plans,
        sessions: store.sessions,
        favoriteExerciseIds: store.favoriteExerciseIds,
        preferences: store.preferences,
      },
      null,
      2,
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "content-env-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("JSON exportado.");
  };

  const importData = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as AppSnapshot;
      setMessage(store.importSnapshot(data) ? "Backup importado." : "JSON invalido para CONTENT.ENV.");
    } catch {
      setMessage("Nao foi possivel ler esse JSON.");
    }
  };

  return (
    <div className="grid gap-5">
      <SectionTitle copy="Tema, backup e manutencao dos dados locais." title="Configuracoes" />
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Palette className="text-lime" size={19} />
          <h3 className="text-lg font-semibold">Aparencia</h3>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-zinc-300">Cor de destaque</p>
            <div className="flex gap-2">
              {accents.map((accent) => (
                <button
                  aria-label={`Cor ${accent}`}
                  className="h-10 w-10 rounded-md border"
                  key={accent}
                  onClick={() => store.updatePreferences({ accent })}
                  style={{
                    background: accent,
                    borderColor: accent === store.preferences.accent ? "#fff" : "rgba(255,255,255,.12)",
                  }}
                  title={accent}
                />
              ))}
            </div>
          </div>
          <label className="grid gap-2 text-sm">
            Densidade
            <select
              className="min-h-11 rounded-md border border-white/10 bg-black/20 px-3"
              onChange={(event) => store.updatePreferences({ density: event.target.value as "comfortable" | "compact" })}
              value={store.preferences.density}
            >
              <option value="comfortable">Confortavel</option>
              <option value="compact">Compacta</option>
            </select>
          </label>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Backup</h3>
        <p className="mt-1 text-sm text-zinc-400">Exporte ou importe fichas, sessoes, favoritos e preferencias.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={exportData}>
            <Download size={18} />
            Exportar JSON
          </Button>
          <Button onClick={() => inputRef.current?.click()} variant="secondary">
            <Upload size={18} />
            Importar JSON
          </Button>
          <input
            accept="application/json"
            className="hidden"
            onChange={(event) => importData(event.target.files?.[0])}
            ref={inputRef}
            type="file"
          />
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Dados locais</h3>
            <p className="mt-1 text-sm text-zinc-400">Restaure os dados mockados iniciais salvos em LocalStorage.</p>
          </div>
          <Button
            onClick={() => {
              store.resetLocalData();
              setMessage("Dados locais restaurados.");
            }}
            variant="danger"
          >
            <RotateCcw size={18} />
            Limpar dados
          </Button>
        </div>
        <Badge className="mt-4">{message}</Badge>
      </Card>
    </div>
  );
}
