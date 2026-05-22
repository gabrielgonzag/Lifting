import { exercises } from "../data/exercises";
import { databaseClient } from "../services/databaseClient";
import type { SavedExercise } from "../types";

export const exerciseRepository = {
  listCatalog() {
    return exercises;
  },
  listSaved(userId: string) {
    return databaseClient
      .read<SavedExercise[]>("saved_exercises", [])
      .filter((exercise) => exercise.userId === userId);
  },
};

