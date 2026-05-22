import type { ReactNode } from "react";
import { Card } from "../ui/card";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="grid min-h-48 place-items-center p-6 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-md bg-white/10 text-lime">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </Card>
  );
}
