import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { createServerFn } from '@tanstack/react-start';
import { source } from '@/lib/source';
import browserCollections from 'collections/browser';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { baseOptions } from '@/lib/layout.shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { Suspense } from 'react';
import { useMDXComponents } from '@/components/mdx';
import { BanknoteArrowUp, Blocks, Home, MessageCircleCode, WalletCards } from 'lucide-react';

export const Route = createFileRoute('/_docs/$')({
  head: () => ({meta: [{title: "Baggit service docs"}]}),
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const serverLoader = createServerFn({
  method: 'GET',
})
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    // you can define props for the component
    _props: undefined,
  ) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody className='text-primary'>
          {/*@ts-ignore*/}
          <MDX components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());

  return (
		<DocsLayout
			{...baseOptions()}
      // tree={data.pageTree}
      links={[
        {
          type: 'main',
          text: 'API Reference',
          url: 'https://api.baggit.link/v1/reference',
          external: true,
        },
        {
          type: 'main',
          text: 'Merchant Dashboard',
          url: 'https://merchant.baggit.link',
					external: true,
				}
			]}
			tabMode='auto'
			tabs={[
				{
					title: "Introduction",
					description: "Getting started",
					url: "/introduction",
					icon: <Home className='size-4' />,
				},
				{
					title: "Checkout",
					description: "Create checkout",
					url: "/checkout/",
					icon: <WalletCards className='size-4' />
				},
				{
					title: "Payout",
					description: "Make payout",
					url: "/payout/",
					icon: <BanknoteArrowUp className='size-4' />
				},
				{
					title: "Widget",
					description: "Buy/Sell, Wallet widget",
					url: "/widget/",
					icon: <Blocks className='size-4' />
				}
			]}
      tree={data.pageTree}
      themeSwitch={{ enabled: true }}
			sidebar={{
				enabled: true,
        banner: (
          <div
            className="p-2 flex items-center justify-between bg-accent rounded-md hover:cursor-pointer"
            onClick={() => {
              const message = prompt('Enter feedback below')
              console.log('Message to send to feedback API', message)
            }}
          >
            Give Feedback
            <MessageCircleCode className="size-4" />
          </div>
        ),
      }}
    >
      <Suspense>{clientLoader.useContent(data.path)}</Suspense>
    </DocsLayout>
  );
}


// function transformPageTree(root: PageTree.Root): PageTree.Root {
//   function mapNode<T extends PageTree.Node>(item: T): T {
//     if (typeof item.icon === 'string') {
//       item = {
//         ...item,
//         icon: (
//           <span
//             dangerouslySetInnerHTML={{
//               __html: item.icon,
//             }}
//           />
//         ),
//       }
//     }

//     if (item.type === 'folder') {
//       return {
//         ...item,
//         index: item.index ? mapNode(item.index) : undefined,
//         children: item.children.map(mapNode),
//       }
//     }

//     return item
//   }

//   return {
//     ...root,
//     children: root.children.map(mapNode),
//     fallback: root.fallback ? transformPageTree(root.fallback) : undefined,
//   }
// }
