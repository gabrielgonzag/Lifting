import { describe, expect, it } from "vitest";
import type { User } from "../../types";
import { validateEmail } from "./emailValidator";
import { canAccessCoach, canAccessElite, canInviteStudents, hasPermission } from "./permissionValidator";
import { activeStudentLimit, canCreateMoreWorkouts, canInviteMoreStudents, workoutPlanLimit } from "./planValidator";
import { validatePassword } from "./passwordValidator";

const user = (plan: User["plan"], role: User["role"] = "casual"): User => ({
  id: `${role}-${plan}`,
  name: "Tester",
  email: `${role}.${plan}@lifto.test`,
  emailVerified: true,
  role,
  plan,
  status: "active",
  createdAt: "2026-05-23T00:00:00.000Z",
  updatedAt: "2026-05-23T00:00:00.000Z",
});

describe("auth business validators", () => {
  it("validates strong passwords with required and recommended checks", () => {
    expect(validatePassword("lifting123").isValid).toBe(false);
    expect(validatePassword("12345678").isValid).toBe(false);
    expect(validatePassword("Lifto123")).toMatchObject({ isValid: true, strength: "media" });
    expect(validatePassword("Lift@2026")).toMatchObject({ isValid: true, strength: "forte" });
  });

  it("normalizes and rejects invalid email formats and domains", () => {
    expect(validateEmail("  GABRIEL@LIFTO.COM ").normalized).toBe("gabriel@lifto.com");
    expect(validateEmail("gabriel@lifting")).toMatchObject({ isValid: false });
    expect(validateEmail("gabriel@lifting..com")).toMatchObject({ isValid: false });
  });

  it("enforces plan permissions and limits", () => {
    expect(workoutPlanLimit("entry")).toBe(20);
    expect(canCreateMoreWorkouts(user("entry"), 19)).toBe(true);
    expect(canCreateMoreWorkouts(user("entry"), 20)).toBe(false);
    expect(canCreateMoreWorkouts(user("core"), 200)).toBe(true);
    expect(activeStudentLimit("coach")).toBe(10);
    expect(canInviteMoreStudents(user("coach", "professional"), 9)).toBe(true);
    expect(canInviteMoreStudents(user("coach", "professional"), 10)).toBe(false);
    expect(canInviteMoreStudents(user("elite", "enterprise_admin"), 100)).toBe(true);
    expect(hasPermission(user("entry"), "export:premium_pdf")).toBe(false);
    expect(hasPermission(user("core"), "export:premium_pdf")).toBe(true);
  });

  it("separates role and plan for coach and elite access", () => {
    expect(canAccessCoach(user("coach", "casual"))).toBe(false);
    expect(canAccessCoach(user("coach", "professional"))).toBe(true);
    expect(canInviteStudents(user("coach", "professional"))).toBe(true);
    expect(canAccessElite(user("coach", "professional"))).toBe(false);
    expect(canAccessElite(user("elite", "enterprise_admin"))).toBe(true);
  });

  it("blocks suspended or unverified accounts regardless of plan", () => {
    expect(hasPermission({ ...user("elite", "enterprise_admin"), emailVerified: false }, "elite:access")).toBe(false);
    expect(hasPermission({ ...user("elite", "enterprise_admin"), status: "suspended" }, "elite:access")).toBe(false);
  });
});

