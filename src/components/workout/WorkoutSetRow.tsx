import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

export type WorkoutDraftSet = {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
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
      className="grid grid-cols-[2rem_minmax(4rem,1fr)_minmax(4rem,1fr)_3.25rem_2.75rem_2.25rem] items-center gap-1 border-b border-white/5 px-1 py-1 last:border-b-0 sm:grid-cols-[3rem_7rem_6rem_4rem_3rem_2.5rem]"
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
      <CompactNumberInput
        decimal
        label={`RPE opcional da serie ${index + 1}`}
        max={10}
        onChange={(value) => onChange("rpe", value)}
        placeholder="-"
        value={set.rpe}
      />
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
  max,
  placeholder,
  value,
  onChange,
}: {
  decimal?: boolean;
  label: string;
  max?: number;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const clean = (raw: string) => {
    const normalized = raw.replace(",", ".").replace(decimal ? /[^0-9.]/g : /\D/g, "");
    const singleDecimal = decimal ? normalized.replace(/(\..*)\./g, "$1") : normalized;
    if (singleDecimal === "") return "";
    const next = Number(singleDecimal);
    if (!Number.isFinite(next) || next < 0 || (max !== undefined && next > max)) return "";
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
