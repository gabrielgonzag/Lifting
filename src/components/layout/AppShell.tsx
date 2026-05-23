import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import type { AppRoute, AppView, User } from "../../types";
import { DesktopNavigation, MobileNavigation } from "../navigation/MainNavigation";

export function AppShell({
  activeRoute,
  activeView,
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
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1480px]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 px-5 py-6 lg:flex">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase text-lime">Fitness notebook</p>
          <h1 className="mt-2 text-3xl font-bold">CONTENT.ENV</h1>
        </div>
        <DesktopNavigation activeRoute={activeRoute} onNavigate={onNavigate} user={user} />
        <div className="mt-auto grid gap-2 rounded-md border border-white/10 bg-white/5 p-3">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="text-xs capitalize text-zinc-500">{user?.role}</p>
          <button className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white" onClick={onLogout}>
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 p-2 lg:hidden">
          <div className="min-w-0 px-2">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="text-xs capitalize text-zinc-500">{user?.role}</p>
          </div>
          <div className="flex gap-1">
            <button
              aria-label="Sair"
              className="grid h-10 w-10 place-items-center rounded-md text-zinc-300 hover:bg-white/10"
              onClick={onLogout}
              title="Sair"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
        {children}
      </main>
      <MobileNavigation activeRoute={activeRoute} onNavigate={onNavigate} user={user} />
    </div>
  );
}
