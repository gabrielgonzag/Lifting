import { CheckCircle2, FileSearch, RefreshCw, Shield, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { professionalVerificationRepository, type ProfessionalVerification } from "../repositories/professionalVerificationRepository";
import type { ProfessionalVerificationStatus } from "../types";

const statusLabel: Record<ProfessionalVerificationStatus, string> = {
  auto_verified: "Auto verificado",
  expired: "Expirado",
  manual_review: "Analise manual",
  pending: "Pendente",
  rejected: "Rejeitado",
  verified: "Verificado",
};

const reviewStatuses = new Set<ProfessionalVerificationStatus>(["manual_review", "pending"]);

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
};

function StatusPill({ status }: { status: ProfessionalVerificationStatus }) {
  const tone =
    status === "verified" || status === "auto_verified"
      ? "border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]"
      : status === "rejected"
        ? "border-red-400/20 bg-red-500/10 text-red-200"
        : "border-amber-300/20 bg-amber-300/10 text-amber-100";

  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-black uppercase ${tone}`}>{statusLabel[status]}</span>;
}

export default function AdminPlaceholder() {
  const [items, setItems] = useState<ProfessionalVerification[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeciding, setIsDeciding] = useState(false);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId]);
  const pendingCount = items.filter((item) => reviewStatuses.has(item.status)).length;
  const reviewedCount = items.length - pendingCount;

  const load = async () => {
    setIsLoading(true);
    const next = await professionalVerificationRepository.listReviewQueue();
    setItems(next);
    setSelectedId((current) => (current && next.some((item) => item.id === current) ? current : next[0]?.id ?? ""));
    setIsLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let alive = true;
    setDocumentUrl("");
    setNotes(selected?.reviewNotes ?? "");

    if (!selected?.documentUrl) return;
    void professionalVerificationRepository.createDocumentUrl(selected.documentUrl).then((url) => {
      if (alive) setDocumentUrl(url ?? "");
    });

    return () => {
      alive = false;
    };
  }, [selected?.documentUrl, selected?.id]);

  const decide = async (approve: boolean) => {
    if (!selected || isDeciding) return;
    setIsDeciding(true);
    const next = await professionalVerificationRepository.decide({ approve, notes, verificationId: selected.id });
    setIsDeciding(false);

    if (!next) {
      setNotice("Nao foi possivel registrar a decisao.");
      return;
    }

    setItems((current) => current.map((item) => (item.id === next.id ? next : item)));
    setNotice(approve ? "Profissional aprovado e area Coach liberada." : "Solicitacao rejeitada.");
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--lime)] text-zinc-950">
            <Shield size={22} />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-[var(--lime)]">Operacao LIFTO</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Validacao CREF</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fg-2)]">
            Analise solicitacoes profissionais, confira o documento privado e registre a decisao de acesso Coach.
          </p>
        </div>
        <Button onClick={load} variant="secondary">
          <RefreshCw size={16} />
          Atualizar
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-bold uppercase text-[var(--fg-3)]">Na fila</p>
          <p className="mt-2 text-3xl font-black">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-bold uppercase text-[var(--fg-3)]">Revisados</p>
          <p className="mt-2 text-3xl font-black">{reviewedCount}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-bold uppercase text-[var(--fg-3)]">Total</p>
          <p className="mt-2 text-3xl font-black">{items.length}</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-[var(--border)] p-4">
            <h2 className="text-lg font-black">Solicitacoes</h2>
          </div>
          <div className="max-h-[620px] overflow-y-auto">
            {isLoading ? <p className="p-4 text-sm text-[var(--fg-2)]">Carregando verificacoes...</p> : null}
            {!isLoading && !items.length ? <p className="p-4 text-sm text-[var(--fg-2)]">Nenhuma solicitacao encontrada.</p> : null}
            {items.map((item) => {
              const active = selected?.id === item.id;
              return (
                <button
                  className={`grid w-full gap-2 border-b border-[var(--border)] p-4 text-left transition hover:bg-white/[.04] ${active ? "bg-white/[.06]" : ""}`}
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{item.fullName}</p>
                      <p className="mt-1 text-xs text-[var(--fg-3)]">{formatDate(item.createdAt)}</p>
                    </div>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="text-sm text-[var(--fg-2)]">
                    CREF {item.crefNumber ?? "-"} - {item.crefRegion ?? "-"}
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="min-h-[620px] overflow-hidden">
          {selected ? (
            <div className="grid gap-5 p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <StatusPill status={selected.status} />
                  <h2 className="mt-3 text-2xl font-black">{selected.fullName}</h2>
                  <p className="mt-1 text-sm text-[var(--fg-2)]">Solicitado em {formatDate(selected.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={isDeciding} onClick={() => decide(true)}>
                    <CheckCircle2 size={16} />
                    Aprovar
                  </Button>
                  <Button disabled={isDeciding} onClick={() => decide(false)} variant="danger">
                    <XCircle size={16} />
                    Rejeitar
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[var(--border)] bg-white/[.03] p-3">
                  <p className="text-xs font-bold uppercase text-[var(--fg-3)]">CREF</p>
                  <p className="mt-1 font-semibold">{selected.crefNumber ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-white/[.03] p-3">
                  <p className="text-xs font-bold uppercase text-[var(--fg-3)]">Regiao</p>
                  <p className="mt-1 font-semibold">{selected.crefRegion ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-white/[.03] p-3">
                  <p className="text-xs font-bold uppercase text-[var(--fg-3)]">Categoria</p>
                  <p className="mt-1 font-semibold">{selected.crefCategory ?? "-"}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-bold" htmlFor="reviewNotes">Notas da revisao</label>
                <textarea
                  className="min-h-24 resize-y rounded-md border border-[var(--border)] bg-[var(--bg-1)] p-3 text-sm outline-none focus:border-[var(--lime-line)]"
                  id="reviewNotes"
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Motivo da aprovacao/rejeicao, divergencias encontradas ou observacoes internas."
                  value={notes}
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black">Documento</h3>
                  {documentUrl ? (
                    <a className="btn btn-secondary btn-sm" href={documentUrl} rel="noreferrer" target="_blank">
                      Abrir
                    </a>
                  ) : null}
                </div>
                <div className="grid min-h-96 place-items-center overflow-hidden rounded-lg border border-[var(--border)] bg-black/20">
                  {!selected.documentUrl ? (
                    <div className="grid justify-items-center gap-2 p-8 text-center text-[var(--fg-2)]">
                      <FileSearch size={28} />
                      <p className="text-sm">Esta solicitacao nao tem carteira anexada.</p>
                    </div>
                  ) : documentUrl ? (
                    selected.documentUrl.toLowerCase().endsWith(".pdf") ? (
                      <iframe className="h-[560px] w-full bg-white" src={documentUrl} title="Documento CREF" />
                    ) : (
                      <img alt="Documento CREF" className="max-h-[560px] w-full object-contain" src={documentUrl} />
                    )
                  ) : (
                    <p className="p-8 text-sm text-[var(--fg-2)]">Gerando acesso temporario ao documento...</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[620px] place-items-center p-8 text-center text-[var(--fg-2)]">
              <p>Selecione uma solicitacao para revisar.</p>
            </div>
          )}
        </Card>
      </section>

      {notice ? <p className="fixed bottom-5 right-5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm shadow-lift">{notice}</p> : null}
    </div>
  );
}
