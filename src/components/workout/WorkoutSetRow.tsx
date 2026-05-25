import { motion } from "framer-motion";
import { Check, Flame, Trash2, Trophy } from "lucide-react";
import { Button } from "../ui/button";

export type WorkoutDraftSet = {
  id: string;
  weight: string;
  reps: string;
  isPr: boolean;
  prType: "reps" | "volume" | "weight";
  rest: string;
  completed: boolean;
};

type WorkoutSetRowProps = {
  index: number;
  set: WorkoutDraftSet;
  removable: boolean;
  onChange: (field: keyof WorkoutDraftSet, value: string | boolean) => void;
  onComplete: () => void;
  onRemove: () => void;
};

export function WorkoutSetRow({ index, set, removable, onChange, onComplete, onRemove }: WorkoutSetRowProps) {
  return (
    <motion.div
      animate={{
        backgroundColor: set.completed ? "rgba(183,243,77,0.08)" : "rgba(255,255,255,0)",
        opacity: set.completed ? 0.58 : 1,
      }}
      className="grid grid-cols-[2rem_minmax(4rem,1fr)_minmax(4rem,1fr)_4.25rem_2.75rem_2.25rem] items-center gap-1 border-b border-white/5 px-1 py-1 last:border-b-0 sm:grid-cols-[3rem_7rem_6rem_4.75rem_3rem_2.5rem]"
      layout
    >
      <span className="text-sm font-semibold text-zinc-400">{index + 1}</span>
      <CompactNumberInput
        decimal
        label={`Carga da serie ${index + 1}`}
        onChange={(value) => onChange("weight", value)}
        placeholder="0"
        value={set.weight}
      />
      <CompactNumberInput
        label={`Repeticoes da serie ${index + 1}`}
        onChange={(value) => onChange("reps", value)}
        placeholder="0"
        value={set.reps}
      />
      <button
        aria-pressed={set.isPr}
        aria-label={`${set.isPr ? "Remover" : "Marcar"} PR na serie ${index + 1}`}
        className={`group grid h-10 place-items-center rounded-md border px-2 text-xs font-black uppercase tracking-tight transition ${
          set.isPr
            ? "border-amber-300/55 bg-amber-300 text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,.24)]"
            : "border-white/10 bg-black/20 text-zinc-500 hover:border-amber-300/35 hover:text-amber-200"
        }`}
        onClick={() => onChange("isPr", !set.isPr)}
        title="Marcar recorde pessoal"
        type="button"
      >
        <motion.span
          animate={{ scale: set.isPr ? [0.85, 1.15, 1] : 1, rotate: set.isPr ? [0, -5, 0] : 0 }}
          className="inline-flex items-center gap-1"
          transition={{ duration: 0.28 }}
        >
          {set.isPr ? <Trophy size={14} fill="currentColor" /> : <Flame size={14} />}
          PR
        </motion.span>
      </button>
      <button
        aria-label={`${set.completed ? "Reabrir" : "Concluir"} serie ${index + 1}`}
        className={`grid h-10 w-10 place-items-center rounded-md transition ${
          set.completed ? "bg-lime text-zinc-950 shadow-[0_0_24px_rgba(183,243,77,.25)]" : "bg-white/10 text-zinc-300 hover:bg-white/15"
        }`}
        onClick={onComplete}
        title="Concluir serie"
      >
        <motion.span
          animate={{ scale: set.completed ? [0.7, 1.18, 1] : 1, rotate: set.completed ? [0, -8, 0] : 0 }}
          transition={{ duration: 0.28 }}
        >
          <Check size={17} strokeWidth={3} />
        </motion.span>
      </button>
      <Button
        aria-label={`Remover serie ${index + 1}`}
        className="h-10 min-h-10 w-10 text-zinc-500"
        disabled={!removable}
        onClick={onRemove}
        size="icon"
        title="Remover serie"
        variant="ghost"
      >
        <Trash2 size={15} />
      </Button>
    </motion.div>
  );
}

function CompactNumberInput({
  decimal,
  label,
  placeholder,
  value,
  onChange,
}: {
  decimal?: boolean;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const clean = (raw: string) => {
    const normalized = raw.replace(",", ".").replace(decimal ? /[^0-9.]/g : /\D/g, "");
    const singleDecimal = decimal ? normalized.replace(/(\..*)\./g, "$1") : normalized;
    if (singleDecimal === "") return "";
    const next = Number(singleDecimal);
    if (!Number.isFinite(next) || next < 0) return "";
    return singleDecimal.replace(/^0+(?=\d)/, "");
  };

  return (
    <input
      aria-label={label}
      className="h-10 w-full rounded-md border border-transparent bg-black/20 px-2 text-center text-base font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-lime focus:bg-black/30"
      inputMode={decimal ? "decimal" : "numeric"}
      onChange={(event) => onChange(clean(event.target.value))}
      pattern={decimal ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
      placeholder={placeholder}
      value={value}
    />
  );
}
