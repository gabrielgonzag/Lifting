import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

type ToastKind = "ok" | "error" | "pr";
type ToastItem = {
  id: string;
  kind?: ToastKind;
  msg: string;
};
type PushToast = (toast: Omit<ToastItem, "id"> | string) => void;

const ToastContext = createContext<PushToast>(() => undefined);

export function ToastHost({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback<PushToast>((toast) => {
    const id = Math.random().toString(36).slice(2);
    const item = typeof toast === "string" ? { id, msg: toast, kind: "ok" as const } : { id, ...toast };
    setItems((current) => [...current, item]);
    window.setTimeout(() => setItems((current) => current.filter((currentItem) => currentItem.id !== id)), 3200);
  }, []);
  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-2">
        {items.map((item) => (
          <div
            className="anim-rise pointer-events-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-2xl"
            key={item.id}
            style={{
              background: "#1a1a1a",
              borderColor: item.kind === "pr" ? "var(--lime-line)" : item.kind === "error" ? "var(--coral-line)" : "var(--border-hi)",
              color: "var(--fg)",
            }}
          >
            {item.kind === "pr" ? <Icon name="trophy" size={16} style={{ color: "var(--lime)" }} /> : null}
            {item.kind === "ok" || !item.kind ? <Icon name="check" size={16} style={{ color: "var(--lime)" }} /> : null}
            {item.kind === "error" ? <Icon name="info" size={16} style={{ color: "var(--coral)" }} /> : null}
            {item.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
