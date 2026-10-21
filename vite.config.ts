import { defineConfig } from "vitest/config";

export default defineConfig({
  // relative Pfade, damit der Build auch in der iOS-App (Capacitor) und auf Vercel läuft
  base: "./",
  build: { target: "es2022", chunkSizeWarningLimit: 1500 },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
