import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../../store/useAuthStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return children;
}

