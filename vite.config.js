import { resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  root: "demo",
  base: "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "demo/index.html"),
        deployFreeMint: resolve(import.meta.dirname, "demo/deploy-free-mint.html")
      }
    }
  }
});
