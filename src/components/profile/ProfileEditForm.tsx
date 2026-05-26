import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { profileService, experienceLevels, goals } from "../../services/profileService";
import type { EditableUserProfile, User } from "../../types";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { AvatarUploader } from "./AvatarUploader";

type ProfileEditFormProps = {
  errors?: Record<string, string>;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (profile: EditableUserProfile) => void;
  user: User;
};

export function ProfileEditForm({ errors = {}, isSaving, onCancel, onSave, user }: ProfileEditFormProps) {
  const [form, setForm] = useState<EditableUserProfile>({
    avatarUrl: user.avatarUrl,
    bio: user.bio ?? "",
    experienceLevel: user.experienceLevel ?? "iniciante",
    goal: user.goal ?? "hipertrofia",
    name: user.name,
    username: user.username ?? user.email.split("@")[0],
  });
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    setForm({
      avatarUrl: user.avatarUrl,
      bio: user.bio ?? "",
      experienceLevel: user.experienceLevel ?? "iniciante",
      goal: user.goal ?? "hipertrofia",
      name: user.name,
      username: user.username ?? user.email.split("@")[0],
    });
  }, [user]);

  const initials = form.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="card card-pad">
      <div className="mb-5">
        <p className="label">Editar perfil</p>
        <h2 className="mt-1 text-xl font-bold tracking-[-0.025em]">Dados pessoais</h2>
      </div>
      <div className="grid gap-5">
        <AvatarUploader
          avatarUrl={form.avatarUrl}
          initials={initials || "LT"}
          onChange={async (avatarUrl) => {
            setAvatarError("");
            if (!avatarUrl && form.avatarUrl) {
              const removed = await profileService.removeAvatar(user.id, form.avatarUrl);
              if (!removed) {
                setAvatarError("Nao foi possivel remover o avatar.");
                return;
              }
            }
            setForm((current) => ({ ...current, avatarUrl }));
          }}
          userId={user.id}
        />
        {avatarError ? <p className="text-xs text-[var(--coral)]">{avatarError}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field error={errors.name} label="Nome">
            <Input onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
          </Field>
          <Field error={errors.username} label="Username">
            <Input onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} value={form.username} />
          </Field>
        </div>

        <Field error={errors.bio} label="Bio">
          <Textarea
            className="min-h-20"
            maxLength={160}
            onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            placeholder="Uma frase curta sobre seu momento no treino."
            value={form.bio}
          />
          <p className="mt-1 text-right text-xs text-[var(--fg-3)]">{form.bio?.length ?? 0}/160</p>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field error={errors.goal} label="Objetivo principal">
            <select className="input" onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value as EditableUserProfile["goal"] }))} value={form.goal}>
              {goals.map((goal) => <option key={goal.value} value={goal.value}>{goal.label}</option>)}
            </select>
          </Field>
          <Field error={errors.experienceLevel} label="Nivel de experiencia">
            <select
              className="input"
              onChange={(event) => setForm((current) => ({ ...current, experienceLevel: event.target.value as EditableUserProfile["experienceLevel"] }))}
              value={form.experienceLevel}
            >
              {experienceLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[.035] p-3 text-sm text-[var(--fg-3)]">
          Role, plano, status e verificacao de email sao protegidos e ficam apenas para leitura.
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onCancel} type="button" variant="secondary">Cancelar</Button>
          <Button disabled={isSaving} onClick={() => onSave(form)} type="button">
            {isSaving ? "Salvando..." : "Salvar perfil"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Field({ children, error, label }: { children: ReactNode; error?: string; label: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-semibold text-[var(--fg)]">{label}</span>
      {children}
      {error ? <span className="text-xs text-[var(--coral)]">{error}</span> : null}
    </label>
  );
}
