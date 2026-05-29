import { Icon } from "../ui/Icon";
import type { LegacyEvent } from "../../features/legacy/legacyTypes";
import { formatDay } from "../../utils/format";

const impactClass: Record<LegacyEvent["impact"], string> = {
  high: "border-[var(--lime-line)] bg-[var(--lime-soft)] text-[var(--lime)]",
  medium: "border-[var(--border)] bg-[var(--card-hi)] text-[var(--fg-2)]",
  mythic: "border-[rgba(245,196,81,.36)] bg-[rgba(245,196,81,.12)] text-[#f5c451]",
};

export function LegacyEventCard({ event }: { event: LegacyEvent }) {
  return (
    <article className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${impactClass[event.impact]}`}>
        <Icon name={event.impact === "mythic" ? "trophy" : "sparkles"} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-sm font-semibold">{event.title}</h3>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">{formatDay(event.occurredAt)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-[var(--fg-3)]">{event.description}</p>
      </div>
    </article>
  );
}
