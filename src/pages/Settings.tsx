import { Download, FileText, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { SectionTitle } from "../components/common/SectionTitle";
import { Toast } from "../components/common/Toast";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { printFitnessReport } from "../services/pdfReport";
import { useAppStore } from "../store/useAppStore";
import type { AppSnapshot } from "../types";

export default function Settings() {
  const store = useAppStore();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = (value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2100);
  };

  const exportJson = () => {
    const payload = JSON.stringify(
      { plans: store.plans, sessions: store.sessions, personalRecords: store.personalRecords },
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
    toast("Backup JSON exportado.");
  };

  const importData = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as AppSnapshot;
      toast(store.importSnapshot(data) ? "Backup importado." : "JSON invalido para CONTENT.ENV.");
    } catch {
      toast("Nao foi possivel ler esse JSON.");
    }
  };

  const reset = () => {
    if (!window.confirm("Apagar fichas, treinos e PRs salvos neste navegador?")) return;
    store.resetLocalData();
    toast("Dados resetados.");
  };

  return (
    <div className="grid gap-5">
      <SectionTitle copy="Relatorio e seguranca dos seus dados." title="Backup" />
      <Card className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold">Relatorio fitness</h3>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Gere um PDF limpo com fichas, series recentes e recordes para guardar ou compartilhar.
        </p>
        <Button
          className="mt-4"
          onClick={() => toast(printFitnessReport(store) ? "Relatorio pronto para salvar em PDF." : "Permita a janela do relatorio.")}
        >
          <FileText size={18} />
          Exportar PDF
        </Button>
      </Card>
      <Card className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold">Backup</h3>
        <p className="mt-1 text-sm text-zinc-400">Leve fichas, historico e PRs em JSON.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={exportJson} variant="secondary">
            <Download size={18} />
            Exportar JSON
          </Button>
          <Button onClick={() => inputRef.current?.click()} variant="secondary">
            <Upload size={18} />
            Importar
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
      <Card className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
        <div>
          <h3 className="text-lg font-semibold">Resetar dados</h3>
          <p className="mt-1 text-sm text-zinc-400">Remove fichas, treinos e recordes deste navegador.</p>
        </div>
        <Button onClick={reset} variant="danger">
          <RotateCcw size={18} />
          Resetar
        </Button>
      </Card>
      <Toast message={message} />
    </div>
  );
}
