import {
  BarChart3,
  Dumbbell,
  Home,
  NotebookPen,
  Settings2,
} from "lucide-react";
import type { ReactNode } from "react";
import type { AppView } from "../../types";
import { cn } from "../../utils/cn";

const navItems: Array<{ view: AppView; label: string; icon: typeof Home }> = [
  { view: "home", label: "Home", icon: Home },
  { view: "plans", label: "Fichas", icon: NotebookPen },
  { view: "workout", label: "Treino", icon: Dumbbell },
  { view: "progress", label: "Progresso", icon: BarChart3 },
  { view: "settings", label: "Backup", icon: Settings2 },
];

export function AppShell({
  activeView,
  children,
  onNavigate,
}: {
  activeView: AppView;
  children: ReactNode;
  onNavigate: (view: AppView) => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1480px]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 px-5 py-6 lg:flex">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase text-lime">Fitness notebook</p>
          <h1 className="mt-2 text-3xl font-bold">CONTENT.ENV</h1>
        </div>
        <nav className="grid gap-2">
          {navItems.map(({ view, label, icon: Icon }) => (
            <button
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-md px-3 text-left text-zinc-300 transition",
                activeView === view ? "bg-white text-zinc-950" : "hover:bg-white/10",
              )}
              key={view}
              onClick={() => onNavigate(view)}
              title={label}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <p className="mt-auto px-3 text-sm text-zinc-500">Fichas e treinos salvos no navegador.</p>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-lg border border-white/10 bg-panel/95 p-1 shadow-lift backdrop-blur lg:hidden">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            className={cn(
              "grid min-h-14 place-items-center rounded-md text-xs text-zinc-400 transition",
              activeView === view ? "bg-white text-zinc-950" : "hover:text-white",
            )}
            key={view}
            onClick={() => onNavigate(view)}
            title={label}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
