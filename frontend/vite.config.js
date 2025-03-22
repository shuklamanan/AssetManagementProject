import { defineConfig } from "vite";

export default defineConfig({
    esbuild: {
        target: "esnext", // Allows top-level await
    },
    build: {
        outDir: "dist",
        target: "esnext", // Ensures the build supports top-level await
    },
});
