import { userRepository } from "../repositories/userRepository";
import type { AuthResult, LoginInput, RegisterInput, User, UserRole } from "../types";
import { makeId } from "../utils/id";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const developerUsers = [
  {
    id: "dev-casual",
    name: "Dev Casual",
    email: "dev.casual@lifting.local",
    password: "lifting-dev",
    role: "casual",
    plan: "free",
  },
  {
    id: "dev-professional",
    name: "Dev Profissional",
    email: "dev.profissional@lifting.local",
    password: "lifting-dev",
    role: "professional",
    plan: "professional",
  },
  {
    id: "dev-admin",
    name: "Dev Admin",
    email: "dev.admin@lifting.local",
    password: "lifting-dev",
    role: "admin",
    plan: "enterprise",
  },
] satisfies Array<Pick<User, "id" | "name" | "email" | "role" | "plan"> & { password: string }>;

const ensureDeveloperUsers = () => {
  const timestamp = new Date().toISOString();
  userRepository.ensure(
    developerUsers.map((user) => ({
      ...user,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  );
};

export const authService = {
  currentUser() {
    ensureDeveloperUsers();
    return userRepository.getSessionUser();
  },
  async login({ email, password, asProfessional }: LoginInput): Promise<AuthResult> {
    const stored = userRepository.findByEmail(normalizeEmail(email));
    if (!stored || stored.password !== password) {
      return { ok: false, message: "Email ou senha invalidos." };
    }
    if (asProfessional && stored.role !== "professional" && stored.role !== "admin") {
      return { ok: false, message: "Essa conta nao possui perfil profissional." };
    }
    userRepository.setSessionUserId(stored.id);
    return { ok: true, user: userRepository.toPublicUser(stored) };
  },
  async loginAsDeveloper(role: UserRole): Promise<AuthResult> {
    ensureDeveloperUsers();
    const account = developerUsers.find((user) => user.role === role);
    const stored = account ? userRepository.findByEmail(account.email) : undefined;
    if (!stored) return { ok: false, message: "Login de desenvolvimento indisponivel." };
    userRepository.setSessionUserId(stored.id);
    return { ok: true, user: userRepository.toPublicUser(stored) };
  },
  async register(input: RegisterInput): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    if (userRepository.findByEmail(email)) {
      return { ok: false, message: "Ja existe uma conta com esse email." };
    }
    const timestamp = new Date().toISOString();
    const user: User = {
      id: makeId("user"),
      name: input.name.trim(),
      email,
      role: input.role,
      plan: input.role === "professional" ? "professional" : "free",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    userRepository.create(user, input.password);
    userRepository.setSessionUserId(user.id);
    return { ok: true, user };
  },
  async logout() {
    userRepository.setSessionUserId();
  },
  async resetPassword(email: string): Promise<AuthResult> {
    const exists = Boolean(userRepository.findByEmail(normalizeEmail(email)));
    return {
      ok: true,
      message: exists
        ? "Instrucoes de recuperacao preparadas para esse email."
        : "Se houver uma conta, as instrucoes serao enviadas.",
    };
  },
};
