import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                /^@mui\//,
                /^@dnd-kit\//,
                /^@emotion\//,
                "date-fns",
                "dequal",
            ],
        },
        sourcemap: true,
    },
});
