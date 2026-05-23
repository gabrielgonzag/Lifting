import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import type { AppRoute, AppView, User } from "./types";

const AdminPlaceholder = lazy(() => import("./pages/AdminPlaceholder"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Plans = lazy(() => import("./pages/Plans"));
const ProfessionalDashboard = lazy(() => import("./pages/ProfessionalDashboard"));
const Progress = lazy(() => import("./pages/Progress"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Settings = lazy(() => import("./pages/Settings"));
const Workout = lazy(() => import("./pages/Workout"));

const routes: AppRoute[] = [
  "home",
  "plans",
  "workout",
  "progress",
  "settings",
  "login",
  "register",
  "reset-password",
  "professional",
  "coach",
  "coach/students",
  "coach/invites",
  "admin",
];
const publicRoutes: AppRoute[] = ["login", "register", "reset-password"];
const appViews: AppView[] = ["home", "plans", "workout", "progress", "settings"];

const hashRoute = (): AppRoute => {
  const route = window.location.hash.replace(/^#\/?/, "").split("?")[0] as AppRoute;
  if (route.startsWith("coach/students/")) return route;
  return routes.includes(route) ? route : "home";
};

const routeForUser = (user: User): AppRoute => {
  if (user.role === "professional") return "coach";
  if (user.role === "admin") return "admin";
  return "home";
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>(hashRoute);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const loadUserData = useAppStore((state) => state.loadUserData);

  const navigate = (next: AppRoute) => {
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

  const guardedRoute = (() => {
    if (!isAuthenticated && !publicRoutes.includes(route)) return "login";
    if (isAuthenticated && publicRoutes.includes(route) && user) return routeForUser(user);
    if ((route === "professional" || route.startsWith("coach")) && user?.role !== "professional" && user?.role !== "admin") return "home";
    if (route === "admin" && user?.role !== "admin") return "home";
    return route;
  })();

  useEffect(() => {
    if (!isLoading && guardedRoute !== route) navigate(guardedRoute);
  }, [guardedRoute, isLoading, route]);

  if (isLoading) {
    return <div className="mx-auto mt-8 min-h-64 max-w-xl animate-pulse rounded-lg border border-white/10 bg-white/5" />;
  }

  if (guardedRoute === "login") return <Login onNavigate={navigate} routeForUser={routeForUser} />;
  if (guardedRoute === "register") return <Register onNavigate={navigate} routeForUser={routeForUser} />;
  if (guardedRoute === "reset-password") return <ResetPassword onNavigate={navigate} />;

  const pageKey = guardedRoute.startsWith("coach/students/") ? "coach" : guardedRoute;
  const pageMap = {
    home: <Home onNavigate={navigate} />,
    plans: <Plans />,
    workout: <Workout />,
    progress: <Progress />,
    settings: <Settings />,
    professional: <ProfessionalDashboard onNavigate={navigate} route="coach" />,
    coach: <ProfessionalDashboard onNavigate={navigate} route={guardedRoute} />,
    "coach/students": <ProfessionalDashboard onNavigate={navigate} route={guardedRoute} />,
    "coach/invites": <ProfessionalDashboard onNavigate={navigate} route={guardedRoute} />,
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
