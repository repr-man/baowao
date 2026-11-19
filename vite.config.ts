import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";
import valence from "valence/vite";

export default defineConfig(({ mode }) => ({
  cacheDir: ".valence/vite",
  build: { assetsInlineLimit: (filePath) => filePath.endsWith(".wasm") },
  worker: { format: "es" },
  // Extract main functions before Solid transforms the source. Solid enables
  // renderer HMR; Valence rebuilds and restarts Electron for main changes.
  plugins: [
    valence({
      app: { lifecycleModule: "./src/electron-lifecycle.ts" },
      window: { autoHideMenuBar: true },
      dev: { launch: mode !== "web", args: ["--no-sandbox"] },
    }),
    solid(),
  ],
}));
