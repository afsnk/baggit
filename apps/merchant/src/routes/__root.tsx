import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
	useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

// import PostHogProvider from '../integrations/posthog/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import { getLocale } from '#/paraglide/runtime'

import appCss from '../styles.css?url'

import { TooltipProvider } from '#/components/ui/tooltip'
import { Toaster } from '#/components/ui/sonner'
import NiceModal from '@ebay/nice-modal-react'
import { ThemeProvider } from '#/components/theme-provider'
import type { MyRouterContext } from '#/integrations/tanstack-query/root-provider'
import { AuthProvider } from '@better-auth-ui/react'
import { authClient } from '#/lib/auth-client'
import { organizationPlugin } from '#/lib/auth/organization-plugin'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Baggit Services',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
			},
			{
				rel: "icon",
				href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💰</text></svg>'
      }
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate()
  return (
    <NiceModal.Provider>
      <html lang={getLocale()}>
        <head>
          <HeadContent />
        </head>
        <body>
          <ThemeProvider defaultTheme="system" storageKey="theme">
            <AuthProvider
              authClient={authClient}
							plugins={[organizationPlugin()]}
							navigate={navigate}
            >
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster position="top-center" />
            </AuthProvider>
          </ThemeProvider>
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
          <Scripts />
        </body>
      </html>
    </NiceModal.Provider>
  )
}
