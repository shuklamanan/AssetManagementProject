import { defineConfig } from "vite";

export default defineConfig({
    esbuild: {
        target: "esnext", // Allows top-level await
    },
    build: {
        target: "esnext", // Ensures the build supports top-level await
    },
});
