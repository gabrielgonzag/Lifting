import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/ui/Icon";
import { useAppStore } from "../../store/useAppStore";
import { useWorkoutSessionStore } from "../../store/useWorkoutSessionStore";
import type { WorkoutPlan, WorkoutSession } from "../../types";
import { bestRecord, estimatedOneRepMax } from "../../utils/records";
import { useGamificationStore, levelTitle, xpProgressPercent } from "../gamification/useGamificationStore";
import { NextSetPreview } from "./NextSetPreview";
import { RestTimer } from "./RestTimer";
import { SetCompletionCard } from "./SetCompletionCard";
import { useWorkoutAudio } from "./useWorkoutAudio";
import { WorkoutGestureLayer } from "./WorkoutGestureLayer";

export function FocusWorkoutScreen({ onExit, plan }: { onExit: () => void; plan: WorkoutPlan }) {
  const sessions = useAppStore((state) => state.sessions);
  const records = useAppStore((state) => state.personalRecords);
  const saveSession = useAppStore((state) => state.saveSession);
  const activePlan = useWorkoutSessionStore((state) => state.activePlan);
  const completeCurrentSet = useWorkoutSessionStore((state) => state.completeCurrentSet);
  const currentIndex = useWorkoutSessionStore((state) => state.currentIndex);
  const focusSets = useWorkoutSessionStore((state) => state.focusSets);
  const resetFocusWorkout = useWorkoutSessionStore((state) => state.resetFocusWorkout);
  const restRemaining = useWorkoutSessionStore((state) => state.restRemaining);
  const skipRest = useWorkoutSessionStore((state) => state.skipRest);
  const startFocusWorkout = useWorkoutSessionStore((state) => state.startFocusWorkout);
  const tickRest = useWorkoutSessionStore((state) => state.tickRest);
  const updateCurrentSet = useWorkoutSessionStore((state) => state.updateCurrentSet);
  const awardWorkoutCompleted = useGamificationStore((state) => state.awardWorkoutCompleted);
  const level = useGamificationStore((state) => state.level);
  const xp = useGamificationStore((state) => state.xp);
  const audio = useWorkoutAudio();
  const [editorOpen, setEditorOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [summary, setSummary] = useState<{ achievementIds: string[]; prs: number; xpGained: number } | null>(null);

  useEffect(() => {
    if (activePlan?.id !== plan.id) startFocusWorkout(plan, sessions);
  }, [activePlan?.id, plan, sessions, startFocusWorkout]);

  useEffect(() => {
    if (restRemaining <= 0) return;
    const timer = window.setTimeout(tickRest, 1000);
    return () => window.clearTimeout(timer);
  }, [restRemaining, tickRest]);

  const currentSet = focusSets[currentIndex];
  const nextSet = focusSets[currentIndex + 1];
  const completedSets = focusSets.filter((set) => set.completed);
  const completionPercent = focusSets.length ? Math.round((completedSets.length / focusSets.length) * 100) : 0;
  const willUnlockPr = useMemo(() => {
    if (!currentSet) return false;
    const previousWeight = bestRecord(records, currentSet.exerciseId, "absolute_weight")?.value ?? 0;
    const previousReps = bestRecord(records, currentSet.exerciseId, "max_reps")?.value ?? 0;
    const previousVolume = bestRecord(records, currentSet.exerciseId, "set_volume")?.value ?? 0;
    const previousOneRm = bestRecord(records, currentSet.exerciseId, "estimated_1rm")?.value ?? 0;
    return (
      currentSet.isPr ||
      currentSet.weight > previousWeight ||
      currentSet.reps > previousReps ||
      currentSet.weight * currentSet.reps > previousVolume ||
      estimatedOneRepMax(currentSet.weight, currentSet.reps) > previousOneRm
    );
  }, [currentSet, records]);

  const finishFocusWorkout = () => {
    const done = focusSets.filter((set) => set.completed || set.isPr);
    if (!done.length || summary) return;
    const session: Omit<WorkoutSession, "createdAt" | "updatedAt" | "userId"> = {
      date: new Date().toISOString(),
      exercises: Object.values(
        done.reduce<Record<string, WorkoutSession["exercises"][number]>>((items, set) => {
          items[set.exerciseId] ??= { exerciseId: set.exerciseId, id: `focus-${set.exerciseId}`, sets: [] };
          items[set.exerciseId].sets.push({
            completed: true,
            id: set.id,
            isPr: set.isPr,
            prType: set.prType,
            reps: set.reps,
            rest: set.restSeconds,
            weight: set.weight,
          });
          return items;
        }, {}),
      ),
      id: `focus-session-${Date.now()}`,
      workoutPlanId: plan.id,
    };
    const prs = saveSession(session);
    const event = awardWorkoutCompleted({
      prs,
      sets: done.length,
      streak: currentStreak([...sessions, session as WorkoutSession]),
      unlocked: strengthAchievements(done),
    });
    if (prs > 0) {
      audio.playPrUnlocked();
      vibrate([80, 40, 100]);
    }
    setSummary({ achievementIds: event.achievementIds, prs, xpGained: event.xpGained });
  };

  useEffect(() => {
    if (focusSets.length && currentIndex >= focusSets.length) finishFocusWorkout();
  }, [currentIndex, focusSets.length]);

  const completeSet = () => {
    if (!currentSet) return;
    const isPr = willUnlockPr;
    if (isPr) updateCurrentSet({ isPr: true });
    const completed = completeCurrentSet();
    if (!completed) return;
    audio.playSetComplete();
    audio.playRestStart();
    vibrate(isPr ? [80, 40, 120] : 35);
  };

  if (!currentSet && !summary) {
    return (
      <div className="grid min-h-full place-items-center bg-black px-5 text-white">
        <button className="btn btn-primary" onClick={onExit} type="button">Voltar</button>
      </div>
    );
  }

  return (
    <WorkoutGestureLayer onSwipeLeft={() => setEditorOpen(true)} onSwipeRight={completeSet} onSwipeUp={() => setHistoryOpen(true)}>
      <div className="min-h-full overflow-auto bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-5 px-5 py-5 pb-24">
          <header className="flex items-center justify-between gap-3">
            <button className="btn btn-ghost btn-sm" onClick={onExit} type="button">
              <Icon name="x" size={15} />
              Sair
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-end gap-3">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--lime)]">
                  LVL {level} - {levelTitle(level)}
                </p>
                <span className="mono text-xs text-[var(--fg-4)]">{xpProgressPercent(xp)}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-[var(--lime)]" animate={{ width: `${xpProgressPercent(xp)}%` }} />
              </div>
            </div>
          </header>

          {summary ? (
            <SetCompletionCard achievementIds={summary.achievementIds} prs={summary.prs} xpGained={summary.xpGained} />
          ) : (
            <>
              <section className="grid flex-1 content-center gap-8 py-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.24em] text-[var(--fg-4)]">{plan.title}</p>
                  <h1 className="mt-4 text-5xl font-black uppercase leading-[.88] tracking-[-0.07em] sm:text-7xl">
                    {currentSet.exerciseName}
                  </h1>
                  <p className="mt-5 text-sm font-black uppercase tracking-[.2em] text-[var(--lime)]">
                    Serie {currentSet.setNumber} de {currentSet.totalSets}
                  </p>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/[.035] p-6">
                  <p className="mono text-center text-5xl font-black tracking-[-0.07em] sm:text-7xl">
                    {currentSet.weight || "-"} <span className="text-2xl text-[var(--fg-4)]">kg</span> x {currentSet.reps} <span className="text-2xl text-[var(--fg-4)]">reps</span>
                  </p>
                  {willUnlockPr ? (
                    <motion.p
                      animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.02, 1] }}
                      className="mt-4 text-center text-sm font-black uppercase tracking-[.2em] text-amber-200"
                      transition={{ repeat: Infinity, duration: 1.4 }}
                    >
                      <Icon className="mr-1 inline" name="trophy" size={15} />
                      PR na mira
                    </motion.p>
                  ) : null}
                </div>

                {restRemaining > 0 ? (
                  <RestTimer nextSet={nextSet} onSkip={skipRest} remaining={restRemaining} total={currentSet.restSeconds} />
                ) : (
                  <div className="grid gap-3">
                    <button className="min-h-16 rounded-2xl bg-[var(--lime)] px-5 text-base font-black uppercase tracking-[.08em] text-zinc-950 shadow-[0_0_48px_rgba(205,255,0,.18)]" onClick={completeSet} type="button">
                      Finalizar serie
                    </button>
                    <NextSetPreview set={nextSet} />
                  </div>
                )}
              </section>

              <footer className="grid gap-2">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div animate={{ width: `${completionPercent}%` }} className="h-full rounded-full bg-[var(--lime)]" />
                </div>
                <p className="text-center text-xs font-bold uppercase tracking-[.18em] text-[var(--fg-4)]">
                  {completedSets.length}/{focusSets.length} series - swipe direita conclui
                </p>
              </footer>
            </>
          )}

          <AnimatePresence>
            {editorOpen && currentSet ? (
              <EditPanel
                isPr={currentSet.isPr}
                onClose={() => setEditorOpen(false)}
                onChange={(patch) => updateCurrentSet(patch)}
                reps={currentSet.reps}
                weight={currentSet.weight}
              />
            ) : null}
            {historyOpen ? <HistoryPanel onClose={() => setHistoryOpen(false)} sessions={sessions} /> : null}
          </AnimatePresence>
        </div>
      </div>
    </WorkoutGestureLayer>
  );
}

function EditPanel({
  isPr,
  onChange,
  onClose,
  reps,
  weight,
}: {
  isPr: boolean;
  onChange: (patch: Partial<{ isPr: boolean; reps: number; weight: number }>) => void;
  onClose: () => void;
  reps: number;
  weight: number;
}) {
  return (
    <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-4 backdrop-blur" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <motion.section animate={{ y: 0 }} className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111] p-5" exit={{ y: 28 }} initial={{ y: 28 }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">Editar serie</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button"><Icon name="x" size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm text-[var(--fg-3)]">
            Peso
            <input className="input text-center text-2xl font-black" min={0} onChange={(event) => onChange({ weight: Number(event.target.value) || 0 })} type="number" value={weight} />
          </label>
          <label className="grid gap-1 text-sm text-[var(--fg-3)]">
            Reps
            <input className="input text-center text-2xl font-black" min={0} onChange={(event) => onChange({ reps: Number(event.target.value) || 0 })} type="number" value={reps} />
          </label>
        </div>
        <button
          className={`mt-4 min-h-12 w-full rounded-xl border text-sm font-black uppercase tracking-[.12em] transition ${isPr ? "border-amber-300 bg-amber-300 text-zinc-950" : "border-white/10 bg-white/[.04] text-[var(--fg-3)]"}`}
          onClick={() => onChange({ isPr: !isPr })}
          type="button"
        >
          Marcar PR
        </button>
      </motion.section>
    </motion.div>
  );
}

function HistoryPanel({ onClose, sessions }: { onClose: () => void; sessions: WorkoutSession[] }) {
  return (
    <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-4 backdrop-blur" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <motion.section animate={{ y: 0 }} className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111] p-5" exit={{ y: 28 }} initial={{ y: 28 }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">Historico rapido</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button"><Icon name="x" size={16} /></button>
        </div>
        <div className="grid max-h-80 gap-2 overflow-auto">
          {sessions.slice(0, 8).map((session) => (
            <div className="rounded-xl border border-white/10 bg-white/[.035] p-3" key={session.id}>
              <p className="text-sm font-bold">{new Date(session.date).toLocaleDateString("pt-BR")}</p>
              <p className="mt-1 text-xs text-[var(--fg-3)]">{session.exercises.length} exercicios registrados</p>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
};

const currentStreak = (sessions: WorkoutSession[]) => {
  const days = new Set(sessions.map((session) => new Date(session.date).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const strengthAchievements = (sets: Array<{ exerciseName: string; weight: number }>) => {
  const names = sets.map((set) => ({ name: set.exerciseName.toLowerCase(), weight: set.weight }));
  const ids: string[] = [];
  if (names.some((set) => set.name.includes("supino") && set.weight >= 40)) ids.push("bench-40");
  if (names.some((set) => set.name.includes("supino") && set.weight >= 100)) ids.push("bench-100");
  if (names.some((set) => set.name.includes("leg") && set.weight >= 300)) ids.push("leg-300");
  if (names.some((set) => set.name.includes("agachamento") && set.weight >= 40)) ids.push("squat-40");
  return ids;
};
