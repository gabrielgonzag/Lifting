import type { WorkoutDnaProfile } from "../../features/workout-dna/workoutDnaTypes";
import { workoutDnaArchetypeLabel } from "../../features/workout-dna/workoutDnaRules";

export function WorkoutDnaSummary({ dna }: { dna: WorkoutDnaProfile }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="label">DNA atual</p>
      <p className="mt-2 text-2xl font-bold tracking-[-0.02em]">{workoutDnaArchetypeLabel(dna.archetype)}</p>
      <p className="mt-1 text-sm text-[var(--fg-3)]">{dna.summary}</p>
    </div>
  );
}
