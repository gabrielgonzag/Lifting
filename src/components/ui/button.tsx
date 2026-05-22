import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "icon";
};

const variants = {
  primary: "bg-[var(--accent)] text-zinc-950 hover:bg-white",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  ghost: "bg-transparent text-zinc-200 hover:bg-white/10",
  danger: "bg-coral/15 text-red-100 hover:bg-coral/25",
};

export function Button({ className, size = "md", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        size === "icon" ? "h-11 w-11" : "min-h-11 px-4 py-2",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
