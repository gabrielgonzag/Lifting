import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import type { AppRoute, AppView } from "./types";
import { appViews, guardRoute, parseHashRoute, routeForUser } from "./guards/routeGuards";

const AdminPlaceholder = lazy(() => import("./pages/AdminPlaceholder"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const AuthError = lazy(() => import("./pages/AuthError"));
const AuthSuccess = lazy(() => import("./pages/AuthSuccess"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const ElitePlaceholder = lazy(() => import("./pages/ElitePlaceholder"));
const Plans = lazy(() => import("./pages/Plans"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfessionalDashboard = lazy(() => import("./pages/ProfessionalDashboard"));
const Progress = lazy(() => import("./pages/Progress"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Settings = lazy(() => import("./pages/Settings"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Workout = lazy(() => import("./pages/Workout"));

const hashRoute = (): AppRoute => (window.location.pathname === "/auth/callback" ? "auth/callback" : parseHashRoute(window.location.hash));

export default function App() {
  const [route, setRoute] = useState<AppRoute>(hashRoute);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const loadUserData = useAppStore((state) => state.loadUserData);

  const navigate = (next: AppRoute) => {
    if (window.location.pathname === "/auth/callback") {
      window.history.replaceState({}, document.title, `/#${next}`);
      setRoute(next);
      return;
    }
    window.location.hash = next;
    setRoute(next);
  };

  useEffect(() => {
    const onHashChange = () => setRoute(hashRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    loadUserData(user?.id);
  }, [loadUserData, user?.id]);

  const guardedRoute = guardRoute({ isAuthenticated, route, user });

  useEffect(() => {
    if (!isLoading && guardedRoute !== route) navigate(guardedRoute);
  }, [guardedRoute, isLoading, route]);

  if (isLoading) {
    return <div className="mx-auto mt-8 min-h-64 max-w-xl animate-pulse rounded-lg border border-white/10 bg-white/5" />;
  }

  const authFallback = <div className="mx-auto mt-8 min-h-64 max-w-xl animate-pulse rounded-lg border border-white/10 bg-white/5" />;

  if (guardedRoute === "login") {
    return (
      <Suspense fallback={authFallback}>
        <Login onNavigate={navigate} routeForUser={routeForUser} />
      </Suspense>
    );
  }
  if (guardedRoute === "register") {
    return (
      <Suspense fallback={authFallback}>
        <Register onNavigate={navigate} routeForUser={routeForUser} />
      </Suspense>
    );
  }
  if (guardedRoute === "reset-password") {
    return (
      <Suspense fallback={authFallback}>
        <ResetPassword onNavigate={navigate} />
      </Suspense>
    );
  }
  if (guardedRoute === "auth-success") {
    return (
      <Suspense fallback={authFallback}>
        <AuthSuccess onNavigate={navigate} />
      </Suspense>
    );
  }
  if (guardedRoute === "auth-error") {
    return (
      <Suspense fallback={authFallback}>
        <AuthError onNavigate={navigate} />
      </Suspense>
    );
  }
  if (guardedRoute === "auth/callback") {
    return (
      <Suspense fallback={authFallback}>
        <AuthCallback onNavigate={navigate} routeForUser={routeForUser} />
      </Suspense>
    );
  }
  if (guardedRoute === "verify-email") {
    return (
      <Suspense fallback={authFallback}>
        <VerifyEmail onNavigate={navigate} />
      </Suspense>
    );
  }

  const pageKey = guardedRoute.startsWith("coach/students/") ? "coach" : guardedRoute;
  const pageMap = {
    home: <Home onNavigate={navigate} />,
    plans: <Plans />,
    profile: <Profile />,
    workout: <Workout />,
    progress: <Progress />,
    settings: <Settings />,
    professional: <ProfessionalDashboard onNavigate={navigate} route="coach" />,
    coach: <ProfessionalDashboard onNavigate={navigate} route={guardedRoute} />,
    "coach/students": <ProfessionalDashboard onNavigate={navigate} route={guardedRoute} />,
    "coach/invites": <ProfessionalDashboard onNavigate={navigate} route={guardedRoute} />,
    elite: <ElitePlaceholder />,
    admin: <AdminPlaceholder />,
  };
  const page = pageKey in pageMap ? pageMap[pageKey as keyof typeof pageMap] : pageMap.home;
  const activeView = appViews.includes(guardedRoute as AppView) ? (guardedRoute as AppView) : "home";

  return (
    <div>
      <AppShell
        activeRoute={guardedRoute}
        activeView={activeView}
        onLogout={async () => {
          await logout();
          navigate("login");
        }}
        onNavigate={navigate}
        user={user}
      >
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={guardedRoute}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<div className="min-h-64 animate-pulse rounded-lg border border-white/10 bg-white/5" />}>
              {page}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </div>
  );
}
