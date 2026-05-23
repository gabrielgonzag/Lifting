import { describe, expect, it } from "vitest";
import type { User } from "../types";
import { guardRoute, parseHashRoute, routeForUser } from "./routeGuards";

const makeUser = (role: User["role"]): User => ({
  id: `${role}-user`,
  name: role,
  email: `${role}@lifting.test`,
  role,
  plan: role === "professional" ? "professional" : "free",
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
    expect(routeForUser(makeUser("admin"))).toBe("admin");
  });

  it("protects private, public, professional, and admin routes", () => {
    expect(guardRoute({ isAuthenticated: false, route: "workout" })).toBe("login");
    expect(guardRoute({ isAuthenticated: true, route: "login", user: makeUser("casual") })).toBe("home");
    expect(guardRoute({ isAuthenticated: true, route: "coach", user: makeUser("casual") })).toBe("home");
    expect(guardRoute({ isAuthenticated: true, route: "coach", user: makeUser("professional") })).toBe("coach");
    expect(guardRoute({ isAuthenticated: true, route: "admin", user: makeUser("professional") })).toBe("home");
    expect(guardRoute({ isAuthenticated: true, route: "admin", user: makeUser("admin") })).toBe("admin");
  });
});
