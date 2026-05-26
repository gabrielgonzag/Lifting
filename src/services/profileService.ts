import { userRepository } from "../repositories/userRepository";
import type { EditableUserProfile, User, UserExperienceLevel, UserGoal } from "../types";
import { hasSupabaseConfig } from "./databaseClient";

export type ProfileValidationResult = {
  ok: boolean;
  errors: Partial<Record<keyof EditableUserProfile | "avatar", string>>;
  value?: EditableUserProfile;
};

export const goals: Array<{ label: string; value: UserGoal }> = [
  { label: "Hipertrofia", value: "hipertrofia" },
  { label: "Forca", value: "forca" },
  { label: "Emagrecimento", value: "emagrecimento" },
  { label: "Condicionamento", value: "condicionamento" },
  { label: "Saude geral", value: "saude_geral" },
];

export const experienceLevels: Array<{ label: string; value: UserExperienceLevel }> = [
  { label: "Iniciante", value: "iniciante" },
  { label: "Intermediario", value: "intermediario" },
  { label: "Avancado", value: "avancado" },
  { label: "Atleta", value: "atleta" },
];

const usernamePattern = /^[a-z0-9._]+$/;
const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];
const maxAvatarSize = 2 * 1024 * 1024;

const cleanText = (value?: string) => value?.trim().replace(/\s+/g, " ") ?? "";
const cleanUsername = (value?: string) => cleanText(value).toLowerCase();

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
    if (input.goal && !goals.some((goal) => goal.value === input.goal)) errors.goal = "Objetivo invalido.";
    if (input.experienceLevel && !experienceLevels.some((level) => level.value === input.experienceLevel)) {
      errors.experienceLevel = "Nivel de experiencia invalido.";
    }

    if (Object.keys(errors).length) return { errors, ok: false };
    return {
      errors: {},
      ok: true,
      value: {
        avatarUrl: input.avatarUrl,
        bio,
        experienceLevel: input.experienceLevel,
        goal: input.goal,
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
    const validation = await this.validateProfile(user.id, input);
    if (!validation.ok || !validation.value) return { ok: false as const, errors: validation.errors };
    const next = await userRepository.updateProfile(user.id, validation.value);
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
