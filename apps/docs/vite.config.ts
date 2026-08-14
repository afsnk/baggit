import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import mdx from "fumadocs-mdx/vite"

const FumadocsDeps = [
  'fumadocs-core',
  'fumadocs-ui',
  '@fumadocs/base-ui',
  '@fumadocs/ui',
]

const config = defineConfig({
	resolve: {
		tsconfigPaths: true,
		noExternal: FumadocsDeps
	},
	ssr: {
		noExternal: FumadocsDeps
	},
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    mdx(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
