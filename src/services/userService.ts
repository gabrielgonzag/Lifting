import { userRepository } from "../repositories/userRepository";
import { hasSupabaseConfig } from "./databaseClient";
import type { User } from "../types";

export const userService = {
  updateProfile(userId: string, profile: Partial<Pick<User, "name" | "avatarUrl">>) {
    return hasSupabaseConfig
      ? userRepository.updateSupabaseProfile(userId, profile)
      : userRepository.update(userId, profile);
  },
};
