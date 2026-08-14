import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { remarkSteps } from 'fumadocs-core/mdx-plugins/remark-steps';
import { remarkImage } from 'fumadocs-core/mdx-plugins';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
	mdxOptions: {
		remarkPlugins: [
			remarkSteps,
			remarkImage
		],
    remarkCodeTabOptions: {
      parseMdx: true,
		},
		rehypeCodeOptions: {
			themes: {
				light: "github-light",
				dark: "github-dark"
			},
			inline: 'tailing-curly-colon'
		}
  },
})
