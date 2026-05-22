import { databaseClient } from "../services/databaseClient";
import type { User } from "../types";

type StoredUser = User & {
  password: string;
};

const users = () => databaseClient.read<StoredUser[]>("users", []);
const saveUsers = (items: StoredUser[]) => databaseClient.write("users", items);

const publicUser = ({ password: _password, ...user }: StoredUser): User => user;

export const userRepository = {
  findByEmail(email: string) {
    return users().find((user) => user.email.toLowerCase() === email.toLowerCase());
  },
  getPublicById(id: string) {
    const user = users().find((item) => item.id === id);
    return user ? publicUser(user) : undefined;
  },
  create(user: User, password: string) {
    saveUsers([...users(), { ...user, password }]);
    return user;
  },
  ensure(items: StoredUser[]) {
    const current = users();
    const knownEmails = new Set(current.map((user) => user.email.toLowerCase()));
    const missing = items.filter((user) => !knownEmails.has(user.email.toLowerCase()));
    if (missing.length) saveUsers([...current, ...missing]);
  },
  update(id: string, profile: Partial<Pick<User, "name" | "avatarUrl" | "plan" | "role">>) {
    let updated: User | undefined;
    saveUsers(
      users().map((user) => {
        if (user.id !== id) return user;
        const next = { ...user, ...profile, updatedAt: new Date().toISOString() };
        updated = publicUser(next);
        return next;
      }),
    );
    return updated;
  },
  setSessionUserId(userId?: string) {
    databaseClient.write("auth_session", userId ?? null);
  },
  getSessionUser() {
    const id = databaseClient.read<string | null>("auth_session", null);
    return id ? this.getPublicById(id) : undefined;
  },
  toPublicUser: publicUser,
};
