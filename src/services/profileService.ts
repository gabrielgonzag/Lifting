import { userRepository } from "../repositories/userRepository";
import type { EditableUserProfile, User } from "../types";
import { auditService } from "./auditService";
import { hasSupabaseConfig } from "./databaseClient";

export type ProfileValidationResult = {
  ok: boolean;
  errors: Partial<Record<keyof EditableUserProfile | "avatar", string>>;
  value?: EditableUserProfile;
};

const usernamePattern = /^[a-z0-9._]+$/;
const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];
const maxAvatarSize = 2 * 1024 * 1024;

const cleanText = (value?: string) => value?.trim().replace(/\s+/g, " ") ?? "";
const cleanUsername = (value?: string) => cleanText(value).toLowerCase();
const protectedProfileFields = new Set(["createdAt", "emailVerified", "plan", "role", "status", "updatedAt"]);

export const profileService = {
  async validateProfile(userId: string, input: Partial<EditableUserProfile>): Promise<ProfileValidationResult> {
    const name = cleanText(input.name);
    const username = cleanUsername(input.username);
    const bio = cleanText(input.bio);
    const errors: ProfileValidationResult["errors"] = {};

    if (name.length < 2) errors.name = "Informe um nome com pelo menos 2 caracteres.";
    if (username.length < 3) errors.username = "Use pelo menos 3 caracteres.";
    else if (!usernamePattern.test(username)) errors.username = "Use apenas letras, numeros, ponto e underline.";
    else if (await userRepository.usernameExists(username, userId)) errors.username = "Esse username ja esta em uso.";
    if (bio.length > 160) errors.bio = "A bio deve ter no maximo 160 caracteres.";

    if (Object.keys(errors).length) return { errors, ok: false };
    return {
      errors: {},
      ok: true,
      value: {
        avatarUrl: input.avatarUrl,
        bio,
        name,
        username,
      },
    };
  },

  validateAvatar(file: File) {
    if (!allowedAvatarTypes.includes(file.type)) return "Use uma imagem JPG, PNG ou WEBP.";
    if (file.size > maxAvatarSize) return "O avatar deve ter no maximo 2MB.";
    return "";
  },

  async updateProfile(user: User, input: Partial<EditableUserProfile>) {
    const attemptedProtectedFields = Object.keys(input).filter((key) => protectedProfileFields.has(key));
    if (attemptedProtectedFields.length) {
      await auditService.record({
        eventType: attemptedProtectedFields.some((field) => field === "role") ? "role_change_attempt" : "plan_change_attempt",
        metadata: { fields: attemptedProtectedFields.join(",") },
        severity: "critical",
        userId: user.id,
      });
      return { ok: false as const, errors: { name: "Campos protegidos nao podem ser alterados pelo app." } };
    }
    const validation = await this.validateProfile(user.id, input);
    if (!validation.ok || !validation.value) return { ok: false as const, errors: validation.errors };
    const next = await userRepository.updateProfile(user.id, validation.value);
    if (next) {
      await auditService.record({ eventType: "profile_updated", severity: "info", userId: user.id });
    }
    return next ? { ok: true as const, user: next } : { ok: false as const, errors: { name: "Nao foi possivel salvar o perfil." } };
  },

  async uploadAvatar(userId: string, file: File) {
    const error = this.validateAvatar(file);
    if (error) return { ok: false as const, message: error };
    const avatarUrl = hasSupabaseConfig
      ? await userRepository.uploadAvatar(userId, file)
      : await userRepository.uploadLocalAvatar(file);
    return avatarUrl ? { avatarUrl, ok: true as const } : { ok: false as const, message: "Nao foi possivel enviar o avatar." };
  },

  async removeAvatar(userId: string, avatarUrl?: string) {
    const removed = hasSupabaseConfig ? await userRepository.removeAvatar(userId, avatarUrl) : true;
    return removed;
  },
};
