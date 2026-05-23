import { useEffect, type ReactNode } from "react";
import { authService } from "../../services/authService";
import { supabase } from "../../services/databaseClient";
import { useAuthStore } from "../../store/useAuthStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    authService.completeOAuthRedirect().then(hydrate);
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      window.setTimeout(hydrate, 0);
    });

    return () => {
      authSubscription?.data.subscription.unsubscribe();
    };
  }, [hydrate]);

  return children;
}
