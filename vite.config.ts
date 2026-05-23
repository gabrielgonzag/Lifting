import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "analyze"
      ? visualizer({
          filename: "dist/bundle-analysis.html",
          gzipSize: true,
          brotliSize: true,
          template: "treemap",
        })
      : undefined,
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          const normalizedId = id.replace(/\\/g, "/");
          if (
            normalizedId.includes("/react/") ||
            normalizedId.includes("/react-dom/") ||
            normalizedId.includes("/react-is/") ||
            normalizedId.includes("/scheduler/")
          ) return "react-vendor";
          if (normalizedId.includes("/recharts/") || normalizedId.includes("/d3-")) return "charts-vendor";
          if (normalizedId.includes("/framer-motion/") || normalizedId.includes("/motion-dom/") || normalizedId.includes("/motion-utils/")) return "motion-vendor";
          if (normalizedId.includes("/@supabase/")) return "supabase-vendor";
          if (normalizedId.includes("/lucide-react/")) return "icons-vendor";
          return "vendor";
        },
      },
    },
  },
}));
