import { userRepository } from "../repositories/userRepository";
import type { User } from "../types";

export const userService = {
  updateProfile(userId: string, profile: Partial<Pick<User, "name" | "avatarUrl">>) {
    return userRepository.update(userId, profile);
  },
};

