import { useRef, useState } from "react";
import { Icon } from "../ui/Icon";
import { profileService } from "../../services/profileService";

export function AvatarUploader({
  avatarUrl,
  initials,
  onChange,
  userId,
}: {
  avatarUrl?: string;
  initials: string;
  onChange: (avatarUrl?: string) => void;
  userId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const result = await profileService.uploadAvatar(userId, file);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onChange(result.avatarUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <button
          className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-[var(--border-hi)] bg-[linear-gradient(135deg,#2b2b2b,#111)] text-xl font-black"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {avatarUrl ? <img alt="" className="h-full w-full object-cover" src={avatarUrl} /> : initials}
          <span className="absolute inset-x-0 bottom-0 grid place-items-center bg-black/60 py-1 text-[10px] uppercase tracking-wider text-white">
            {uploading ? "..." : "Foto"}
          </span>
        </button>
        <div className="grid gap-2">
          <button className="btn btn-secondary btn-sm justify-start" onClick={() => inputRef.current?.click()} type="button">
            <Icon name="edit" size={13} />
            Alterar avatar
          </button>
          {avatarUrl ? (
            <button className="btn btn-ghost btn-sm justify-start text-[var(--fg-3)]" onClick={() => onChange(undefined)} type="button">
              <Icon name="trash" size={13} />
              Remover
            </button>
          ) : null}
        </div>
      </div>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => upload(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />
      {error ? <p className="text-xs text-[var(--coral)]">{error}</p> : null}
    </div>
  );
}
