import { Icon, type IconName } from "../ui/Icon";

export type ProfileStat = {
  icon: IconName;
  label: string;
  sub?: string;
  value: string;
};

export function ProfileStats({ stats }: { stats: ProfileStat[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <article className="card p-4" key={stat.label}>
          <div className="mb-3 flex items-center gap-2 text-[var(--fg-3)]">
            <Icon name={stat.icon} size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">{stat.label}</span>
          </div>
          <p className="text-2xl font-black tracking-[-0.03em]">{stat.value}</p>
          {stat.sub ? <p className="mt-1 text-xs text-[var(--fg-3)]">{stat.sub}</p> : null}
        </article>
      ))}
    </section>
  );
}
