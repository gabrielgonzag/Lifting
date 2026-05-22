import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function Toast({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 right-4 z-[60] flex max-w-sm items-center gap-2 rounded-md border border-white/10 bg-zinc-950/95 px-4 py-3 text-sm text-zinc-100 shadow-lift backdrop-blur lg:bottom-5"
      initial={{ opacity: 0, y: 10 }}
    >
      <CheckCircle2 className="text-lime" size={17} />
      {message}
    </motion.div>
  );
}
