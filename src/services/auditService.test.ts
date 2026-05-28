import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.hoisted(() => vi.fn());

vi.mock("../repositories/auditRepository", () => ({
  auditRepository: { create },
}));

describe("audit service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sanitizes sensitive metadata before writing audit logs", async () => {
    const { auditService } = await import("./auditService");

    await auditService.record({
      eventType: "login_failed",
      metadata: {
        email: "gabriel@lifto.test",
        password: "secret",
        refresh_token: "token",
      },
      severity: "warning",
      userId: "user-a",
    });

    expect(create).toHaveBeenCalledWith({
      eventType: "login_failed",
      metadata: { email: "gabriel@lifto.test" },
      severity: "warning",
      userId: "user-a",
    });
  });
});

