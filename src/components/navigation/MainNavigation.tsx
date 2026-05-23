import { BarChart3, BriefcaseBusiness, Building2, Dumbbell, Home, NotebookPen, Settings2 } from "lucide-react";
import { permissionService } from "../../services/permissionService";
import type { AppRoute, AppView, User } from "../../types";
import { cn } from "../../utils/cn";

type NavItem = {
  view: AppRoute;
  label: string;
  icon: typeof Home;
};

const baseNavItems: NavItem[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "plans", label: "Fichas", icon: NotebookPen },
  { view: "workout", label: "Treino", icon: Dumbbell },
  { view: "progress", label: "Progresso", icon: BarChart3 },
  { view: "settings", label: "Backup", icon: Settings2 },
];

const navItemsFor = (user?: User): NavItem[] => {
  const professionalItems: NavItem[] = [];
  if (permissionService.canAccessCoach(user)) professionalItems.push({ view: "coach", label: "Coach", icon: BriefcaseBusiness });
  if (permissionService.canAccessElite(user)) professionalItems.push({ view: "elite", label: "Elite", icon: Building2 });
  return professionalItems.length
    ? [...baseNavItems.slice(0, 3), ...professionalItems, ...baseNavItems.slice(3)]
    : baseNavItems;
};

const isActive = (activeRoute: AppRoute, item: NavItem) =>
  item.view === "coach"
    ? activeRoute === "professional" || activeRoute.startsWith("coach")
    : activeRoute === item.view;

export function DesktopNavigation({
  activeRoute,
  onNavigate,
  user,
}: {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  user?: User;
}) {
  return (
    <nav className="grid gap-2">
      {navItemsFor(user).map(({ view, label, icon: Icon }) => {
        const active = isActive(activeRoute, { view, label, icon: Icon });
        return (
          <button
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-md px-3 text-left text-zinc-300 transition hover:-translate-y-px hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lime/40",
              active && "bg-white text-zinc-950 hover:bg-white",
            )}
            key={view}
            onClick={() => onNavigate(view)}
            title={label}
          >
            <Icon size={19} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export function MobileNavigation({
  activeRoute,
  onNavigate,
  user,
}: {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  user?: User;
}) {
  const items = navItemsFor(user);
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 grid rounded-lg border border-white/10 bg-panel/95 p-1 shadow-lift backdrop-blur lg:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(({ view, label, icon: Icon }) => {
        const active = isActive(activeRoute, { view, label, icon: Icon });
        return (
          <button
            className={cn(
              "grid min-h-14 place-items-center rounded-md text-[11px] text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-lime/40",
              active && "bg-white text-zinc-950 hover:text-zinc-950",
            )}
            key={view}
            onClick={() => onNavigate(view)}
            title={label}
          >
            <Icon size={19} />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export const appViews: AppView[] = ["home", "plans", "workout", "progress", "settings"];
