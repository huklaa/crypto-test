import { defineConfig } from "vite";
export default defineConfig({
  root: "demo",
  base: "/",
  build: { outDir: "../dist", emptyOutDir: true }
});
