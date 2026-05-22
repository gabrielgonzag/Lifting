import { databaseClient, supabase } from "../services/databaseClient";
import type { User } from "../types";

type StoredUser = User & {
  password: string;
};

const users = () => databaseClient.read<StoredUser[]>("users", []);
const saveUsers = (items: StoredUser[]) => databaseClient.write("users", items);

const publicUser = ({ password: _password, ...user }: StoredUser): User => user;

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: User["role"];
  plan: User["plan"];
  created_at: string;
  updated_at: string;
};

const profileToUser = (profile: ProfileRow): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  avatarUrl: profile.avatar_url ?? undefined,
  role: profile.role,
  plan: profile.plan,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

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
  async getSupabaseProfile(id: string) {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    return error || !data ? undefined : profileToUser(data as ProfileRow);
  },
  async updateSupabaseProfile(id: string, profile: Partial<Pick<User, "name" | "avatarUrl">>) {
    if (!supabase) return undefined;
    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        avatar_url: profile.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return error || !data ? undefined : profileToUser(data as ProfileRow);
  },
  toPublicUser: publicUser,
};
