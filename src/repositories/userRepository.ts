import { databaseClient, supabase } from "../services/databaseClient";
import type { EditableUserProfile, User } from "../types";

type StoredUser = User & {
  password: string;
};

const users = () => databaseClient.read<StoredUser[]>("users", []);
const saveUsers = (items: StoredUser[]) => databaseClient.write("users", items);

const publicUser = ({ password: _password, ...user }: StoredUser): User => user;

type ProfileRow = {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  email_verified?: boolean | null;
  avatar_url: string | null;
  bio?: string | null;
  goal?: User["goal"] | null;
  experience_level?: User["experienceLevel"] | null;
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
  username: profile.username ?? undefined,
  email: profile.email,
  emailVerified: profile.email_verified ?? false,
  avatarUrl: profile.avatar_url ?? undefined,
  bio: profile.bio ?? undefined,
  goal: profile.goal ?? undefined,
  experienceLevel: profile.experience_level ?? undefined,
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
  async getCurrentProfile(id: string) {
    return supabase ? this.getSupabaseProfile(id) : this.getPublicById(id);
  },
  create(user: User, password: string) {
    saveUsers([...users(), { ...user, password }]);
    return user;
  },
  update(id: string, profile: Partial<EditableUserProfile>) {
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
  async updateSupabaseProfile(id: string, profile: Partial<EditableUserProfile>) {
    if (!supabase) return undefined;
    const update: Partial<ProfileRow> = {
      updated_at: new Date().toISOString(),
    };
    if ("name" in profile) update.name = profile.name;
    if ("username" in profile) update.username = profile.username;
    if ("avatarUrl" in profile) update.avatar_url = profile.avatarUrl ?? null;
    if ("bio" in profile) update.bio = profile.bio;

    const { data, error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return error || !data ? undefined : profileToUser(data as ProfileRow);
  },
  async updateProfile(id: string, profile: Partial<EditableUserProfile>) {
    return supabase ? this.updateSupabaseProfile(id, profile) : this.update(id, profile);
  },
  async usernameExists(username: string, exceptUserId?: string) {
    const normalized = username.toLowerCase();
    if (supabase) {
      let query = supabase.from("profiles").select("id").eq("username", normalized).limit(1);
      if (exceptUserId) query = query.neq("id", exceptUserId);
      const { data, error } = await query;
      return !error && Boolean(data?.length);
    }
    return users().some((user) => user.username?.toLowerCase() === normalized && user.id !== exceptUserId);
  },
  async uploadAvatar(userId: string, file: File) {
    if (!supabase) return undefined;
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) return undefined;
    return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  },
  async uploadLocalAvatar(file: File) {
    return new Promise<string | undefined>((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => resolve(undefined);
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : undefined);
      reader.readAsDataURL(file);
    });
  },
  async removeAvatar(_userId: string, avatarUrl?: string) {
    if (!supabase || !avatarUrl) return true;
    const marker = "/avatars/";
    const path = avatarUrl.includes(marker) ? avatarUrl.split(marker)[1] : "";
    if (!path) return true;
    const { error } = await supabase.storage.from("avatars").remove([path]);
    return !error;
  },
  toPublicUser: publicUser,
};
