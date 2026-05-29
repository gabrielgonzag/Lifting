import { useMemo, useState } from "react";
import { LegacyTitles } from "../components/profile/LegacyTitles";
import { LegacySummary } from "../components/legacy/LegacySummary";
import { ProfileAchievements } from "../components/profile/ProfileAchievements";
import { ProfileEditForm } from "../components/profile/ProfileEditForm";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileStats, type ProfileStat } from "../components/profile/ProfileStats";
import { Icon } from "../components/ui/Icon";
import { useToast } from "../components/ui/Toast";
import { WorkoutDnaCard } from "../components/workout-dna/WorkoutDnaCard";
import { exercises } from "../data/exercises";
import { useGamificationStore } from "../features/gamification/useGamificationStore";
import { legacyService } from "../features/legacy/legacyService";
import { workoutDnaService } from "../features/workout-dna/workoutDnaService";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import type { EditableUserProfile, User } from "../types";
import { sessionVolume } from "../utils/format";

const statusLabel: Record<User["status"], string> = {
  active: "Ativo",
  pending_verification: "Pendente",
  suspended: "Suspenso",
};

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateCurrentUserProfile);
  const sessions = useAppStore((state) => state.sessions);
  const records = useAppStore((state) => state.personalRecords);
  const progression = useGamificationStore();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bestExercise = useMemo(() => {
    const best = [...records].sort((left, right) => right.value - left.value)[0];
    if (!best) return "Sem PR ainda";
    return exercises.find((exercise) => exercise.id === best.exerciseId)?.name ?? best.exerciseName;
  }, [records]);

  const totalVolume = useMemo(
    () => progression.totalVolume || sessions.reduce((total, session) => total + sessionVolume(session), 0),
    [progression.totalVolume, sessions],
  );
  const workoutDna = useMemo(
    () => workoutDnaService.calculate({ personalRecords: records, sessions, streak: progression.streak }),
    [progression.streak, records, sessions],
  );
  const legacy = useMemo(
    () =>
      legacyService.build({
        personalRecords: records,
        progression: {
          currentTitleId: progression.currentTitleId,
          streak: progression.streak,
          titleIds: progression.titleIds,
          totalVolume,
          workoutsCompleted: progression.workoutsCompleted || sessions.length,
        },
        sessions,
      }),
    [progression.currentTitleId, progression.streak, progression.titleIds, progression.workoutsCompleted, records, sessions, totalVolume],
  );

  if (!user) {
    return (
      <div className="mx-auto grid min-h-80 max-w-xl place-items-center px-5 text-center">
        <p className="text-[var(--fg-3)]">Entre para visualizar seu perfil.</p>
      </div>
    );
  }

  const stats: ProfileStat[] = [
    { icon: "dumbbell", label: "Treinos concluidos", value: String(progression.workoutsCompleted || sessions.length), sub: "rituais registrados" },
    { icon: "trophy", label: "PRs batidos", value: String(progression.prs || records.length), sub: "recordes pessoais" },
    { icon: "flame", label: "Sequencia", value: String(progression.streak), sub: "dias seguidos" },
    { icon: "sparkles", label: "XP total", value: String(progression.totalXp), sub: "progressao acumulada" },
    { icon: "profile", label: "Nivel atual", value: `LVL ${progression.level}`, sub: user.plan.toUpperCase() },
    { icon: "chart", label: "Melhor exercicio", value: bestExercise, sub: "com base nos PRs" },
  ];

  const save = async (profile: EditableUserProfile) => {
    setSaving(true);
    setErrors({});
    try {
      const result = await updateProfile(profile);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        toast({ kind: "error", msg: "Revise os campos do perfil." });
        return;
      }
      toast({ kind: "ok", msg: "Perfil atualizado." });
      setEditing(false);
    } catch {
      toast({ kind: "error", msg: "Nao foi possivel salvar o perfil." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full overflow-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-6 pb-24 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label">Perfil</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em]">Sua evolucao</h1>
            <p className="mt-2 text-sm text-[var(--fg-3)]">Identidade, progresso e conquistas no LIFTO.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setEditing((value) => !value)} type="button">
            <Icon name={editing ? "x" : "edit"} size={16} />
            {editing ? "Fechar edicao" : "Editar perfil"}
          </button>
        </header>

        <ProfileHeader level={progression.level} totalXp={progression.totalXp} user={user} xp={progression.xp} />

        <section className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyItem label="Email" value={user.email} />
          <ReadOnlyItem label="Role" value={user.role} />
          <ReadOnlyItem label="Status" value={statusLabel[user.status]} />
          <ReadOnlyItem label="Conta criada" value={new Date(user.createdAt).toLocaleDateString("pt-BR")} />
          <ReadOnlyItem label="Verificacao" value={user.emailVerified ? "Email verificado" : "Email pendente"} />
          <ReadOnlyItem label="Ultima atualizacao" value={new Date(user.updatedAt).toLocaleDateString("pt-BR")} />
        </section>

        {editing ? <ProfileEditForm errors={errors} isSaving={saving} onCancel={() => setEditing(false)} onSave={save} user={user} /> : null}

        <ProfileStats stats={stats} />
        <WorkoutDnaCard dna={workoutDna} />
        <LegacySummary legacy={legacy} />
        <LegacyTitles
          officialTitleIds={progression.titleIds}
          stats={{
            level: progression.level,
            prs: progression.prs || records.length,
            streak: progression.streak,
            volume: totalVolume,
            workouts: progression.workoutsCompleted || sessions.length,
          }}
        />
        <ProfileAchievements achievementIds={progression.achievements} />
      </div>
    </div>
  );
}

function ReadOnlyItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--fg-3)]">{label}</p>
      <p className="mt-1 truncate font-semibold text-[var(--fg)]">{value}</p>
    </div>
  );
}
