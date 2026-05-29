import { CheckCircle2, ShieldCheck, UploadCloud } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Toast } from "../components/common/Toast";
import { crefVerificationService } from "../services/crefVerificationService";
import { useAuthStore } from "../store/useAuthStore";
import type { AppRoute } from "../types";

const categories = ["Bacharel", "Licenciatura", "Provisionado", "Tecnologo"];
const regions = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];

export default function ProfessionalVerification({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const user = useAuthStore((state) => state.user);
  const refreshCurrentUserProfile = useAuthStore((state) => state.refreshCurrentUserProfile);
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [cpf, setCpf] = useState("");
  const [crefNumber, setCrefNumber] = useState("");
  const [crefRegion, setCrefRegion] = useState("SP");
  const [crefCategory, setCrefCategory] = useState(categories[0]);
  const [document, setDocument] = useState<File | undefined>();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [publicConsultationAuthorized, setPublicConsultationAuthorized] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const status = user?.professionalVerificationStatus ?? "pending";
  const isUnderReview = status === "manual_review" || status === "pending";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setErrors({});
    const result = await crefVerificationService.submit(user, {
      acceptedTerms,
      cpf,
      crefCategory,
      crefNumber,
      crefRegion,
      document,
      fullName,
      publicConsultationAuthorized,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setErrors(result.errors);
      setNotice("Revise os dados destacados.");
      return;
    }

    await refreshCurrentUserProfile();
    setNotice(
      result.verification.status === "auto_verified"
        ? "Credencial validada. Area Coach liberada."
        : "Recebemos seus dados profissionais. Sua verificacao esta em analise.",
    );
    if (result.verification.status === "auto_verified") onNavigate("coach");
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--fg)] sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <section className="flex min-h-[calc(100vh-3rem)] flex-col justify-center">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--lime)] text-zinc-950">
            <ShieldCheck size={25} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--lime)]">Area Coach LIFTO</p>
          <h1 className="mt-4 max-w-xl text-4xl font-black leading-none tracking-tight sm:text-6xl">
            Verifique sua credencial profissional.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--fg-2)]">
            Area exclusiva para profissionais de Educacao Fisica. Use seu CREF para liberar ferramentas de coach sem expor CPF puro no sistema.
          </p>
          <div className="mt-7 grid gap-3 text-sm text-[var(--fg-2)]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--lime)]" size={18} />
              Dados usados apenas para validacao profissional.
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--lime)]" size={18} />
              Divergencias entram em analise manual.
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--lime)]" size={18} />
              Acesso Coach fica bloqueado ate aprovacao.
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <Card className="w-full p-4 sm:p-6">
            {isUnderReview && status === "manual_review" ? (
              <div className="mb-4 rounded-lg border border-[var(--lime-line)] bg-[var(--lime-soft)] p-4 text-sm text-[var(--fg)]">
                Recebemos seus dados profissionais. Sua verificacao esta em analise.
              </div>
            ) : null}
            <form className="grid gap-4" onSubmit={submit}>
              <div className="grid gap-1">
                <label className="text-sm font-semibold" htmlFor="fullName">Nome completo</label>
                <Input id="fullName" onChange={(event) => setFullName(event.target.value)} value={fullName} />
                {errors.fullName ? <p className="text-xs text-red-300">{errors.fullName}</p> : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-sm font-semibold" htmlFor="cpf">CPF</label>
                  <Input id="cpf" inputMode="numeric" maxLength={14} onChange={(event) => setCpf(event.target.value)} placeholder="000.000.000-00" value={cpf} />
                  {errors.cpf ? <p className="text-xs text-red-300">{errors.cpf}</p> : null}
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-semibold" htmlFor="crefNumber">Numero do CREF</label>
                  <Input id="crefNumber" onChange={(event) => setCrefNumber(event.target.value)} placeholder="123456-G" value={crefNumber} />
                  {errors.crefNumber ? <p className="text-xs text-red-300">{errors.crefNumber}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold">
                  Estado/regiao
                  <select className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[var(--fg)]" onChange={(event) => setCrefRegion(event.target.value)} value={crefRegion}>
                    {regions.map((region) => <option key={region}>{region}</option>)}
                  </select>
                  {errors.crefRegion ? <span className="text-xs text-red-300">{errors.crefRegion}</span> : null}
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Categoria
                  <select className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[var(--fg)]" onChange={(event) => setCrefCategory(event.target.value)} value={crefCategory}>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  {errors.crefCategory ? <span className="text-xs text-red-300">{errors.crefCategory}</span> : null}
                </label>
              </div>

              <label className="grid cursor-pointer gap-2 rounded-lg border border-dashed border-[var(--border-hi)] bg-white/[.03] p-4 text-sm">
                <span className="flex items-center gap-2 font-semibold"><UploadCloud size={18} /> Carteira profissional opcional</span>
                <input
                  className="text-sm text-[var(--fg-2)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--lime)] file:px-3 file:py-2 file:text-sm file:font-bold file:text-zinc-950"
                  onChange={(event) => setDocument(event.target.files?.[0])}
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                />
                {errors.document ? <span className="text-xs text-red-300">{errors.document}</span> : null}
              </label>

              <label className="flex items-start gap-3 text-sm text-[var(--fg-2)]">
                <input checked={acceptedTerms} className="mt-1" onChange={(event) => setAcceptedTerms(event.target.checked)} type="checkbox" />
                Aceito que meus dados profissionais sejam usados apenas para validacao e seguranca da area Coach.
              </label>
              {errors.acceptedTerms ? <p className="text-xs text-red-300">{errors.acceptedTerms}</p> : null}

              <label className="flex items-start gap-3 text-sm text-[var(--fg-2)]">
                <input checked={publicConsultationAuthorized} className="mt-1" onChange={(event) => setPublicConsultationAuthorized(event.target.checked)} type="checkbox" />
                Autorizo consulta publica ao CREF/CONFEF quando houver integracao oficial server-side disponivel.
              </label>
              {errors.publicConsultationAuthorized ? <p className="text-xs text-red-300">{errors.publicConsultationAuthorized}</p> : null}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Enviando..." : "Enviar verificacao"}
                </Button>
                <Button onClick={() => onNavigate("home")} type="button" variant="secondary">
                  Voltar
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
      <Toast message={notice} />
    </main>
  );
}
