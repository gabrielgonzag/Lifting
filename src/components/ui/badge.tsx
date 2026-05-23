import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "muted" | "accent";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-medium text-zinc-200",
        variant === "muted" && "bg-white/[.04] text-zinc-400",
        variant === "accent" && "border-lime/20 bg-lime/15 text-lime",
        className,
      )}
      {...props}
    />
  );
}
