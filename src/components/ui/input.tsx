import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-white outline-none transition placeholder:text-zinc-500 focus:border-lime",
        className,
      )}
      {...props}
    />
  );
}
