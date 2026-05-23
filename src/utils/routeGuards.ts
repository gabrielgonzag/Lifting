import type { AppRoute, AppView, User } from "../types";

export const routes: AppRoute[] = [
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

export const publicRoutes: AppRoute[] = ["login", "register", "reset-password"];

export const appViews: AppView[] = ["home", "plans", "workout", "progress", "settings"];

export const routeForUser = (user: User): AppRoute => {
  if (user.role === "professional") return "coach";
  if (user.role === "admin") return "admin";
  return "home";
};

export const parseHashRoute = (hash: string): AppRoute => {
  const route = hash.replace(/^#\/?/, "").split("?")[0] as AppRoute;
  if (route.startsWith("coach/students/")) return route;
  return routes.includes(route) ? route : "home";
};

export const guardRoute = ({
  isAuthenticated,
  route,
  user,
}: {
  isAuthenticated: boolean;
  route: AppRoute;
  user?: User | null;
}): AppRoute => {
  if (!isAuthenticated && !publicRoutes.includes(route)) return "login";
  if (isAuthenticated && publicRoutes.includes(route) && user) return routeForUser(user);
  if ((route === "professional" || route.startsWith("coach")) && user?.role !== "professional" && user?.role !== "admin") {
    return "home";
  }
  if (route === "admin" && user?.role !== "admin") return "home";
  return route;
};
