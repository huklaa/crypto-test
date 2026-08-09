import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  base: process.env.GITHUB_ACTIONS ? "/crypto-test/" : "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});
