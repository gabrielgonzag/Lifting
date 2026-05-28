import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { AppRoute, User } from "../../types";
import { Icon } from "../ui/Icon";

const initialsFor = (name?: string) =>
  (name || "LT")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function MobileProfileMenu({
  activeRoute,
  hidden,
  onLogout,
  onNavigate,
  user,
}: {
  activeRoute: AppRoute;
  hidden?: boolean;
  onLogout: () => void;
  onNavigate: (route: AppRoute) => void;
  user?: User;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const initials = initialsFor(user?.name);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  const navigate = (route: AppRoute) => {
    setOpen(false);
    onNavigate(route);
  };

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-end border-b border-white/[.06] bg-[rgba(10,10,10,.72)] px-4 backdrop-blur-xl transition-transform duration-200 ease-out lg:hidden ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      }`}
      ref={rootRef}
    >
      <button
        aria-expanded={open}
        aria-label="Abrir menu do perfil"
        className={`grid h-9 w-9 place-items-center overflow-hidden rounded-full border bg-[var(--card)] text-xs font-black text-[var(--fg)] shadow-[0_12px_32px_rgba(0,0,0,.35)] transition active:scale-95 ${
          open || activeRoute === "profile"
            ? "border-[var(--lime)] shadow-[0_0_28px_rgba(190,255,0,.12)]"
            : "border-[var(--border-hi)] hover:border-[var(--lime)] hover:bg-[var(--card-hi)]"
        }`}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {user?.avatarUrl ? <img alt="" className="h-full w-full object-cover" src={user.avatarUrl} /> : initials}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute right-4 top-14 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-hi)] bg-[rgba(20,20,20,.88)] shadow-[0_28px_80px_rgba(0,0,0,.55)] backdrop-blur-xl"
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16 }}
          >
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border-hi)] bg-[linear-gradient(135deg,#2a2a2a,#111)] text-sm font-black">
                  {user?.avatarUrl ? <img alt="" className="h-full w-full object-cover" src={user.avatarUrl} /> : initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--fg)]">{user?.name ?? "Lifto"}</p>
                  <p className="truncate text-xs text-[var(--fg-3)]">{user?.email ?? "usuario@lifto.app"}</p>
                  <span className="mt-2 inline-flex rounded-full border border-[var(--lime)]/25 bg-[var(--lime)]/10 px-2 py-0.5 text-[10px] font-black uppercase text-[var(--lime)]">
                    {user?.plan ?? "entry"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid p-2">
              <MenuButton icon="profile" label="Meu Perfil" onClick={() => navigate("profile")} />
              <MenuButton icon="settings" label="Configuracoes" onClick={() => navigate("settings")} />
              <button
                className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-[var(--fg-2)] transition hover:bg-white/[.06] hover:text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--lime)]/50"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                type="button"
              >
                <Icon name="log_out" size={17} />
                Sair
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, label, onClick }: { icon: "profile" | "settings"; label: string; onClick: () => void }) {
  return (
    <button
      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-[var(--fg-2)] transition hover:bg-white/[.06] hover:text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--lime)]/50"
      onClick={onClick}
      type="button"
    >
      <Icon name={icon} size={17} />
      {label}
    </button>
  );
}
