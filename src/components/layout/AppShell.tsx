import type { ReactNode } from "react";
import { Icon, type IconName } from "../ui/Icon";
import type { AppRoute, AppView, User } from "../../types";
import { levelTitle, useGamificationStore, xpProgressPercent } from "../../features/gamification/useGamificationStore";
import { canAccessCoach, canAccessElite } from "../../utils/validators/permissionValidator";

type NavItem = {
  route: AppRoute;
  active: (route: AppRoute) => boolean;
  icon: IconName;
  label: string;
  mobile?: boolean;
};

const baseNav: NavItem[] = [
  { route: "home", active: (route) => route === "home", icon: "home", label: "Home", mobile: true },
  { route: "plans", active: (route) => route === "plans", icon: "book", label: "Fichas", mobile: true },
  { route: "workout", active: (route) => route === "workout", icon: "dumbbell", label: "Treino", mobile: true },
  { route: "progress", active: (route) => route === "progress", icon: "chart", label: "Progresso", mobile: true },
  { route: "settings", active: (route) => route === "settings", icon: "settings", label: "Backup" },
];

const navForUser = (user?: User): NavItem[] => {
  const nav = [...baseNav];
  if (canAccessCoach(user)) nav.splice(3, 0, { route: "coach", active: (route) => route === "professional" || route.startsWith("coach"), icon: "list", label: "Coach" });
  if (canAccessElite(user)) nav.splice(4, 0, { route: "elite", active: (route) => route === "elite", icon: "sparkles", label: "Elite" });
  return nav;
};

function Wordmark() {
  return (
    <div className="flex items-center gap-2 text-[22px] font-black tracking-[-0.04em] text-[var(--fg)]">
      <div className="grid h-[22px] w-[22px] place-items-center rounded-md bg-[var(--lime)]">
        <svg fill="none" height="14" viewBox="0 0 24 24" width="14">
          <path d="M5 7v10M9 4v16M15 4v16M19 7v10M3 12h2M19 12h2M9 12h6" stroke="#0a0a0a" strokeLinecap="round" strokeWidth="2.4" />
        </svg>
      </div>
      <span>LIFTING</span>
    </div>
  );
}

function UserChip({ user }: { user?: User }) {
  const level = useGamificationStore((state) => state.level);
  const xp = useGamificationStore((state) => state.xp);
  const progress = xpProgressPercent(xp);
  const initials = (user?.name || "LT")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border-hi)] bg-[linear-gradient(135deg,#2a2a2a,#151515)] text-sm font-bold">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--fg)]">{user?.name ?? "Lifting"}</p>
        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 rounded bg-[var(--lime)] px-1.5 py-0.5 text-[8px] font-black uppercase leading-none text-zinc-950">LVL {level}</span>
          <p className="min-w-0 truncate text-[9px] font-bold uppercase tracking-wider text-[var(--lime)]">
            {levelTitle(level)} - {user?.plan ?? "entry"}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full rounded-full bg-[var(--lime)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  activeRoute,
  children,
  onLogout,
  onNavigate,
  user,
}: {
  activeRoute: AppRoute;
  activeView: AppView;
  children: ReactNode;
  onLogout: () => void;
  onNavigate: (view: AppRoute) => void;
  user?: User;
}) {
  const nav = navForUser(user);
  const mobileNav = nav.filter((item) => item.mobile);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <aside className="hidden w-[232px] shrink-0 flex-col gap-5 border-r border-[var(--border)] bg-[var(--bg-1)] px-3.5 py-5 lg:flex">
        <div className="px-1.5">
          <Wordmark />
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.active(activeRoute);
            return (
              <button
                className="relative flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium transition hover:bg-[var(--card)] hover:text-[var(--fg)]"
                key={item.route}
                onClick={() => onNavigate(item.route)}
                style={{
                  background: active ? "var(--card-hi)" : "transparent",
                  color: active ? "var(--fg)" : "var(--fg-2)",
                }}
              >
                {active ? <span className="absolute -left-3.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-[var(--lime)]" /> : null}
                <Icon name={item.icon} size={17} stroke={active ? 1.9 : 1.6} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto grid gap-2">
          <UserChip user={user} />
          <button className="btn btn-ghost btn-sm justify-start text-[var(--fg-3)]" onClick={onLogout}>
            <Icon name="log_out" size={14} />
            Sair
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto pb-24 lg:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[var(--border)] bg-[rgba(10,10,10,0.92)] px-1 pb-3 pt-2 backdrop-blur lg:hidden">
        {mobileNav.map((item) => {
          const active = item.active(activeRoute);
          return (
            <button
              className="grid min-h-14 place-items-center gap-1 text-[11px] font-medium"
              key={item.route}
              onClick={() => onNavigate(item.route)}
              style={{ color: active ? "var(--fg)" : "var(--fg-3)" }}
            >
              <span className="relative">
                {active ? <span className="absolute -top-3 left-1/2 h-1 w-6 -translate-x-1/2 rounded bg-[var(--lime)]" /> : null}
                <Icon name={item.icon} size={20} stroke={active ? 1.9 : 1.6} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
