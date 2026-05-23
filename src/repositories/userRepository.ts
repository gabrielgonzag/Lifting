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
  email_verified?: boolean | null;
  avatar_url: string | null;
  role: User["role"];
  plan: User["plan"] | "free" | "basic" | "professional" | "enterprise";
  status?: User["status"] | null;
  created_at: string;
  updated_at: string;
};

const normalizePlan = (plan: ProfileRow["plan"]): User["plan"] => {
  if (plan === "free") return "entry";
  if (plan === "basic") return "core";
  if (plan === "professional") return "coach";
  if (plan === "enterprise") return "elite";
  return plan;
};

const normalizeRole = (role: ProfileRow["role"]) => role;

const profileToUser = (profile: ProfileRow): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  emailVerified: profile.email_verified ?? true,
  avatarUrl: profile.avatar_url ?? undefined,
  role: normalizeRole(profile.role),
  plan: normalizePlan(profile.plan),
  status: profile.status ?? (profile.email_verified === false ? "pending_verification" : "active"),
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
  async ensureSupabaseProfile(id: string) {
    if (!supabase) return undefined;
    const existing = await this.getSupabaseProfile(id);
    if (existing) return existing;

    const { error } = await supabase.rpc("ensure_profile");
    return error ? undefined : this.getSupabaseProfile(id);
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
