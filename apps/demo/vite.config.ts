import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
// import path from 'path'

const config = defineConfig({
  server: {
    port: parseInt(process.env.PORT ?? "3000"),
  },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  // optimizeDeps: {
  //   include: ["@afsnk/ui"]
  // },
  // css: {
  //   modules: { localsConvention: "camelCase" }
  // },
  // resolve: {
  //   alias: {
  //     '@afsnk/ui': path.resolve(__dirname, '../../packages/ui/src')
  //   }
  // }
})

export default config
