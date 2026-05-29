import { describe, expect, it } from "vitest";
import type { User } from "../types";
import { guardRoute, parseHashRoute, routeForUser } from "./routeGuards";

const makeUser = (role: User["role"]): User => ({
  id: `${role}-user`,
  name: role,
  email: `${role}@lifto.test`,
  emailVerified: true,
  role,
  plan: role === "professional" ? "coach" : role === "admin" ? "elite" : "entry",
  status: "active",
  professionalVerificationStatus: role === "professional" ? "verified" : undefined,
  createdAt: "2026-05-23T00:00:00.000Z",
  updatedAt: "2026-05-23T00:00:00.000Z",
});

describe("route guards", () => {
  it("normalizes hash routes and keeps contextual coach student routes", () => {
    expect(parseHashRoute("#/progress?tab=pr")).toBe("progress");
    expect(parseHashRoute("#/coach/students/student-1/progress")).toBe("coach/students/student-1/progress");
    expect(parseHashRoute("#/unknown")).toBe("home");
  });

  it("sends users to the right first route for their role", () => {
    expect(routeForUser(makeUser("casual"))).toBe("home");
    expect(routeForUser(makeUser("professional"))).toBe("coach");
    expect(routeForUser({ ...makeUser("enterprise_admin"), plan: "elite" })).toBe("elite");
    expect(routeForUser(makeUser("admin"))).toBe("admin");
  });

  it("protects private, public, professional, and admin routes", () => {
    expect(guardRoute({ isAuthenticated: false, route: "workout" })).toBe("login");
    expect(guardRoute({ isAuthenticated: true, route: "login", user: makeUser("casual") })).toBe("home");
    expect(guardRoute({ isAuthenticated: true, route: "auth/callback", user: makeUser("casual") })).toBe("home");
    expect(guardRoute({ isAuthenticated: true, route: "coach", user: makeUser("casual") })).toBe("home");
    expect(guardRoute({ isAuthenticated: true, route: "coach", user: makeUser("professional") })).toBe("coach");
    expect(guardRoute({ isAuthenticated: true, route: "elite", user: makeUser("professional") })).toBe("home");
    expect(guardRoute({ isAuthenticated: true, route: "admin", user: makeUser("professional") })).toBe("home");
    expect(guardRoute({ isAuthenticated: true, route: "admin", user: makeUser("admin") })).toBe("admin");
  });

  it("keeps coach routes behind professional CREF verification", () => {
    const unverifiedProfessional = { ...makeUser("professional"), professionalVerificationStatus: "manual_review" as const };
    const professionalApplicant = { ...makeUser("casual"), professionalVerificationStatus: "pending" as const };

    expect(guardRoute({ isAuthenticated: true, route: "coach", user: unverifiedProfessional })).toBe("professional-verification");
    expect(routeForUser(professionalApplicant)).toBe("professional-verification");
    expect(guardRoute({ isAuthenticated: true, route: "professional-verification", user: unverifiedProfessional })).toBe("professional-verification");
    expect(guardRoute({ isAuthenticated: true, route: "professional-verification", user: makeUser("professional") })).toBe("coach");
    expect(guardRoute({ isAuthenticated: true, route: "professional-verification", user: makeUser("casual") })).toBe("home");
  });

  it("keeps unverified users inside the verification flow", () => {
    const pending = { ...makeUser("casual"), emailVerified: false, status: "pending_verification" as const };

    expect(guardRoute({ isAuthenticated: true, route: "home", user: pending })).toBe("verify-email");
    expect(guardRoute({ isAuthenticated: true, route: "verify-email", user: pending })).toBe("verify-email");
  });
});

