import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm"],
  dts: true,
  clean: true,
  // react/react-dom are runtime deps of the worker too; bundle them
  // so the worker doesn't need JSX tooling. Externalize if you prefer.
  noExternal: ["@react-email/components", "@react-email/render"],
  external: ["react", "react-dom"],
});
