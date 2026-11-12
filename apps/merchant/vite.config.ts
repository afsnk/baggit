import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from "nitro/vite"
import { execSync } from 'node:child_process'

const config = defineConfig({
	resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: 'tslib/tslib.es6.mjs',
    },
  },
  ssr: {
    noExternal: [/@better-auth\/passkey/],
    external: [],
  },
  logLevel: 'error',
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['url', 'baseLocale'],
		}),
		nitro({
			rollupConfig: { external: [/^@sentry\//] },
      hooks: {
        compiled() {
					console.log(`[compiled] App compiled`)
					execSync(`npx drizzle-kit push`, {stdio: "inherit"})
					console.log(`[drizzle] DB Pushed!`)
        },
      },
      cloudflare: { deployConfig: false },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
