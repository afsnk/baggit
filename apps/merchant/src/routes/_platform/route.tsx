import { AppSidebar } from '#/components/app-sidebar'
import Balance from '#/routes/_platform/_orchestra/-components/analytics/Balance'
import { Container, Main, Section } from '#/components/craft'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'
import { Tooltip, TooltipTrigger, TooltipContent } from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import { authGuard } from '#/server/auth-guard'
import { createFileRoute, Outlet, useMatch, useRouterState } from '@tanstack/react-router'
import { Construction } from 'lucide-react'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/_platform')({
  component: RouteComponent,
  beforeLoad: async () => {
    await authGuard()
  },
})

function RouteComponent() {
  const routerState = useRouterState()

	const isOrchestra = routerState.location.pathname.includes('analytics')
		|| routerState.location.pathname.includes('audit-logs')
		|| routerState.location.pathname.includes('overview')

  const matched = useMatch({
    from: `/_platform${isOrchestra? '/_orchestra' : ''}${routerState.location.pathname}` as any,
		shouldThrow: false,
  })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Main>
          <Section className="p-4! sticky top-0 dark:bg-black bg-white z-150">
            <Container className="p-0! flex">
							<div className="capitalize flex items-center gap-2">
								<SidebarTrigger className='-ml-1' />
								<Separator
									orientation='vertical'
									className="mx-2 data-[orientation=vertical]:h-4"
								/>
                {matched?.context.isUnderConstruction &&
                  <Tooltip>
                    <TooltipTrigger>
                      <Construction className={cn("text-amber-400 animate-pulse size-4")} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className='max-w-xs text-wrap line-clamp-2 text-center'>This page is currently under active development, report any issues you encounter</span>
                    </TooltipContent>
                  </Tooltip>
                }
                {routerState.location.pathname.slice(1)}
              </div>
              <div className='flex-1 flex justify-end'>
                {routerState.location.pathname.slice(1).toLowerCase() === "analytics" && (
                  <Balance />
                )}
              </div>
            </Container>
          </Section>
          <Section className="p-4!">
            <Container className="p-0! w-full">
              <Outlet />
            </Container>
          </Section>
        </Main>
      </SidebarInset>
    </SidebarProvider>
  )
}
