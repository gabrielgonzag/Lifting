import type { LegacySummary as LegacySummaryType } from "../../features/legacy/legacyTypes";
import { LegacyEventCard } from "./LegacyEventCard";

export function LegacyTimeline({ legacy, limit = 5 }: { legacy: LegacySummaryType; limit?: number }) {
  const events = legacy.events.slice(0, limit);
  return (
    <div className="grid gap-2">
      {events.length ? (
        events.map((event) => <LegacyEventCard event={event} key={event.id} />)
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--fg-3)]">
          Finalize treinos e bata seus primeiros PRs para construir seu legado.
        </div>
      )}
    </div>
  );
}
