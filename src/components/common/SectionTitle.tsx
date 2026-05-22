import type { ReactNode } from "react";

export function SectionTitle({
  title,
  copy,
  action,
}: {
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {copy ? <p className="mt-1 text-sm text-zinc-400">{copy}</p> : null}
      </div>
      {action}
    </div>
  );
}
