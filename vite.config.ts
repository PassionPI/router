import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";

export default mergeConfig(
  defineViteConfig({
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      lib: {
        name: "radix",
        entry: "src/index.ts",
        formats: ["cjs", "es"],
        fileName: (format) =>
          format === "cjs" ? `bundle.${format}` : `bundle.${format}.js`,
      },
    },
  }),
  defineVitestConfig({
    test: {},
  })
);
