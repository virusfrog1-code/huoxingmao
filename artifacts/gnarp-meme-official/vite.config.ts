import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  base: "/",
  plugins: [
    nodePolyfills({ protocolImports: true }),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false,
    },
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
