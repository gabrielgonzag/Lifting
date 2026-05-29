import type { AppRoute, AppView, User } from "../types";
import { canAccessCoach, canAccessElite, needsProfessionalVerification } from "../utils/validators/permissionValidator";

export const routes: AppRoute[] = [
  "home",
  "plans",
  "workout",
  "progress",
  "profile",
  "settings",
  "login",
  "register",
  "reset-password",
  "auth-success",
  "auth-error",
  "auth/callback",
  "verify-email",
  "professional-verification",
  "professional",
  "coach",
  "coach/students",
  "coach/invites",
  "coach/workouts",
  "coach/profile",
  "elite",
  "admin",
];

export const publicRoutes: AppRoute[] = ["login", "register", "reset-password", "auth-success", "auth-error", "auth/callback"];

export const appViews: AppView[] = ["home", "plans", "workout", "progress", "profile", "settings"];

export const routeForUser = (user: User): AppRoute => {
  if (user.role === "admin") return "admin";
  if (canAccessElite(user)) return "elite";
  if (needsProfessionalVerification(user)) return "professional-verification";
  if (canAccessCoach(user)) return "coach";
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
  if (!isAuthenticated) return route;
  if (!user) return "login";

  if ((user.status === "pending_verification" || !user.emailVerified) && route !== "verify-email") {
    return "verify-email";
  }

  if (route === "verify-email" && user.emailVerified && user.status === "active") return routeForUser(user);
  if (publicRoutes.includes(route)) return routeForUser(user);
  if (route === "professional-verification") {
    if (needsProfessionalVerification(user)) return route;
    return canAccessCoach(user) ? "coach" : "home";
  }
  if (route === "professional" || route.startsWith("coach")) {
    if (canAccessCoach(user)) return route;
    return needsProfessionalVerification(user) ? "professional-verification" : "home";
  }
  if (route === "elite" && !canAccessElite(user)) return "home";
  if (route === "admin" && user.role !== "admin") return "home";
  return route;
};
