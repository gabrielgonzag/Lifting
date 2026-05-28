import type { PersonalRecord, WorkoutPlan, WorkoutSession } from "../types";
import { exercises } from "../data/exercises";
import { formatLongDate } from "../utils/format";
import { recordLabel, recordValueLabel } from "../utils/records";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const safeCssColor = (value: string) => (/^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : "#B7F34D");

export function printFitnessReport({
  plans,
  sessions,
  personalRecords,
}: {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
}) {
  const report = window.open("", "_blank", "width=960,height=760");
  if (!report) return false;

  const plansMarkup = plans
    .map((plan) => {
      const exerciseNames = plan.blocks
        .flatMap((block) => block.exerciseIds)
        .map((id) => exercises.find((exercise) => exercise.id === id)?.name)
        .filter(Boolean)
        .map((name) => `<li>${escapeHtml(name!)}</li>`)
        .join("");
      return `<article><span class="bar" style="background:${safeCssColor(plan.color)}"></span><h3>${escapeHtml(plan.title)}</h3><p>${escapeHtml(plan.description || "Ficha sem descricao.")}</p><ul>${exerciseNames}</ul></article>`;
    })
    .join("");
  const historyMarkup = sessions
    .slice(0, 12)
    .map((session) => {
      const sets = session.exercises
        .map((entry) => {
          const name = exercises.find((exercise) => exercise.id === entry.exerciseId)?.name ?? "Exercicio";
          const summary = entry.sets.map((set) => `${set.weight} kg x ${set.reps}`).join(" | ");
          return `<li><strong>${escapeHtml(name)}</strong><span>${escapeHtml(summary)}</span></li>`;
        })
        .join("");
      return `<article><h3>${escapeHtml(formatLongDate(session.date))}</h3><ul class="history">${sets}</ul></article>`;
    })
    .join("");
  const recordsMarkup = [...personalRecords]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 16)
    .map(
      (record) =>
        `<tr><td>${escapeHtml(record.exerciseName)}</td><td>${recordLabel(record.type)}</td><td>${recordValueLabel(record)}</td><td>${record.weight} kg x ${record.reps}</td><td>${escapeHtml(formatLongDate(record.date))}</td></tr>`,
    )
    .join("");

  report.document.write(`<!doctype html><html lang="pt-BR"><head><title>LIFTO relatorio</title><style>
    *{box-sizing:border-box}body{margin:0;background:#f4f4f1;color:#171717;font:14px Inter,Arial,sans-serif}
    main{max-width:920px;margin:auto;padding:52px}header{border-bottom:2px solid #171717;padding-bottom:24px}
    small{letter-spacing:.12em;text-transform:uppercase;color:#555}h1{font-size:42px;margin:8px 0}h2{font-size:20px;margin:34px 0 14px}
    .grid{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr))}article{break-inside:avoid;background:#fff;border:1px solid #ddd;border-radius:10px;padding:18px}
    h3{margin:0 0 8px;font-size:17px}p{color:#555;margin:0 0 12px}ul{margin:0;padding-left:18px;display:grid;gap:6px}.bar{display:block;width:56px;height:5px;border-radius:99px;margin-bottom:14px}
    table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #ddd;border-radius:10px;overflow:hidden}th,td{text-align:left;padding:11px;border-bottom:1px solid #eee}th{font-size:11px;text-transform:uppercase;color:#666}
    .history li{display:flex;justify-content:space-between;gap:12px}.hero{display:flex;gap:18px;margin-top:18px}.metric{background:#171717;color:#fff;border-radius:10px;padding:14px;min-width:130px}.metric b{display:block;font-size:24px}
    @media print{body{background:#fff}main{padding:24px}.no-print{display:none}}
  </style></head><body><main><header><small>Relatorio fitness</small><h1>LIFTO</h1><p>Fichas, sessoes recentes e recordes pessoais.</p><div class="hero"><div class="metric"><b>${plans.length}</b>fichas</div><div class="metric"><b>${sessions.length}</b>treinos</div><div class="metric"><b>${personalRecords.length}</b>PRs</div></div></header><h2>Fichas</h2><section class="grid">${plansMarkup || "<article>Nenhuma ficha criada.</article>"}</section><h2>Recordes</h2><table><thead><tr><th>Exercicio</th><th>Tipo</th><th>Valor</th><th>Serie</th><th>Data</th></tr></thead><tbody>${recordsMarkup || "<tr><td colspan='5'>Nenhum PR registrado.</td></tr>"}</tbody></table><h2>Historico recente</h2><section class="grid">${historyMarkup || "<article>Nenhum treino registrado.</article>"}</section></main></body></html>`);
  report.document.close();
  report.focus();
  report.print();
  return true;
}
