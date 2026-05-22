import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import type { AppView } from "./types";

const Home = lazy(() => import("./pages/Home"));
const Plans = lazy(() => import("./pages/Plans"));
const Progress = lazy(() => import("./pages/Progress"));
const Settings = lazy(() => import("./pages/Settings"));
const Workout = lazy(() => import("./pages/Workout"));

export default function App() {
  const [view, setView] = useState<AppView>("home");
  const page = {
    home: <Home onNavigate={setView} />,
    plans: <Plans />,
    workout: <Workout />,
    progress: <Progress />,
    settings: <Settings />,
  }[view];

  return (
    <div>
      <AppShell activeView={view} onNavigate={setView}>
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={view}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<div className="min-h-64 animate-pulse rounded-lg border border-white/10 bg-white/5" />}>
              {page}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </AppShell>
    </div>
  );
}
