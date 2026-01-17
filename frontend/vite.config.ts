import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@components": path.resolve(__dirname, "./src/components"),
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:3001",
                changeOrigin: true,
                secure: false,
            },
            "/statements": {
                target: "http://localhost:3001",
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: "dist",
        sourcemap: true,
    },
});
