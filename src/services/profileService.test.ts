import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../types";

const storage = vi.hoisted(() => new Map<string, unknown>());

vi.mock("./databaseClient", () => ({
  databaseClient: {
    read: <T>(collection: string, fallback: T) => (storage.has(collection) ? storage.get(collection) as T : fallback),
    write: (collection: string, value: unknown) => storage.set(collection, value),
  },
  hasSupabaseConfig: false,
  supabase: undefined,
}));

const baseUser = (id: string, username: string): User => ({
  createdAt: "2026-05-26T00:00:00.000Z",
  email: `${username}@lifto.test`,
  emailVerified: true,
  id,
  name: "Gabriel Gonzaga",
  plan: "entry",
  role: "casual",
  status: "active",
  updatedAt: "2026-05-26T00:00:00.000Z",
  username,
});

describe("profile service", () => {
  beforeEach(() => {
    storage.clear();
  });

  it("loads the current public profile from the repository", async () => {
    const { userRepository } = await import("../repositories/userRepository");
    userRepository.create(baseUser("user-a", "gabriel"), "secret");

    expect(userRepository.getPublicById("user-a")?.username).toBe("gabriel");
  });

  it("edits name, username and bio", async () => {
    const { profileService } = await import("./profileService");
    const { userRepository } = await import("../repositories/userRepository");
    const user = userRepository.create(baseUser("user-a", "gabriel"), "secret");

    const result = await profileService.updateProfile(user, {
      bio: "Treino pesado, execucao limpa.",
      name: "Gabriel G.",
      username: "gabriel.g",
    });

    expect(result.ok).toBe(true);
    expect(result.ok && result.user.name).toBe("Gabriel G.");
    expect(result.ok && result.user.username).toBe("gabriel.g");
    expect(result.ok && result.user.bio).toBe("Treino pesado, execucao limpa.");
  });

  it("blocks invalid usernames", async () => {
    const { profileService } = await import("./profileService");
    const { userRepository } = await import("../repositories/userRepository");
    const user = userRepository.create(baseUser("user-a", "gabriel"), "secret");

    const result = await profileService.updateProfile(user, {
      name: "Gabriel",
      username: "ga br!",
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.errors.username).toContain("letras");
  });

  it("blocks duplicated usernames", async () => {
    const { profileService } = await import("./profileService");
    const { userRepository } = await import("../repositories/userRepository");
    userRepository.create(baseUser("user-a", "gabriel"), "secret");
    const user = userRepository.create(baseUser("user-b", "marcos"), "secret");

    const result = await profileService.updateProfile(user, {
      name: "Marcos",
      username: "gabriel",
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.errors.username).toContain("uso");
  });

  it("blocks protected role, plan and status updates through profile updates", async () => {
    const { profileService } = await import("./profileService");
    const { userRepository } = await import("../repositories/userRepository");
    const user = userRepository.create(baseUser("user-a", "gabriel"), "secret");

    const result = await profileService.updateProfile(user, {
      name: "Gabriel Seguro",
      experienceLevel: "atleta",
      goal: "forca",
      plan: "elite",
      role: "admin",
      status: "suspended",
      username: "gabriel",
    } as Parameters<typeof profileService.updateProfile>[1] & Record<string, string>);

    const updated = userRepository.getPublicById("user-a");
    expect(result.ok).toBe(false);
    expect(updated?.name).toBe("Gabriel Gonzaga");
    expect(updated?.role).toBe("casual");
    expect(updated?.plan).toBe("entry");
    expect(updated?.status).toBe("active");
    expect(updated?.goal).toBeUndefined();
    expect(updated?.experienceLevel).toBeUndefined();
  });

  it("validates the bio limit", async () => {
    const { profileService } = await import("./profileService");
    const { userRepository } = await import("../repositories/userRepository");
    const user = userRepository.create(baseUser("user-a", "gabriel"), "secret");

    const result = await profileService.updateProfile(user, {
      bio: "x".repeat(161),
      name: "Gabriel",
      username: "gabriel",
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? "" : result.errors.bio).toContain("160");
  });
});

