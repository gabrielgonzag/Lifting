import { Icon } from "../ui/Icon";
import type { LegacySummary as LegacySummaryType } from "../../features/legacy/legacyTypes";
import { LegacyTimeline } from "./LegacyTimeline";

export function LegacySummary({ legacy }: { legacy: LegacySummaryType }) {
  return (
    <section className="card card-pad anim-rise">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[rgba(245,196,81,.36)] bg-[rgba(245,196,81,.12)] text-[#f5c451]">
            <Icon name="trophy" size={18} />
          </div>
          <div>
            <p className="label">Legacy</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.015em]">{legacy.currentTitle}</h2>
            <p className="mt-1 text-sm text-[var(--fg-3)]">{legacy.timelineLabel}</p>
          </div>
        </div>
        <span className="badge border-[rgba(245,196,81,.36)] bg-[rgba(245,196,81,.12)] text-[#f5c451]">
          {legacy.totalMilestones} marcos
        </span>
      </div>

      {legacy.featuredEvent ? (
        <div className="mb-4 rounded-xl border border-[var(--border-hi)] bg-[var(--card-hi)] p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--fg-3)]">Momento marcante</p>
          <p className="mt-1 text-lg font-semibold">{legacy.featuredEvent.title}</p>
          <p className="mt-1 text-sm text-[var(--fg-3)]">{legacy.featuredEvent.description}</p>
        </div>
      ) : null}

      <LegacyTimeline legacy={legacy} />
    </section>
  );
}
