import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "domain/index": "src/domain/index.ts",
    "application/index": "src/application/index.ts",
    "ports/index": "src/ports/index.ts",
    "registry/index": "src/registry/index.ts",
    "primitives/index": "src/primitives/index.ts",
    "adapters/index": "src/adapters/index.ts",
    "providers/index": "src/providers/index.ts",
    "sdk/index": "src/sdk/index.ts",
  },
  format: ["esm", "cjs"],
  target: "es2022",
  sourcemap: true,
  clean: true,
  dts: true,
  splitting: false,
})
