import { AppSidebar } from '#/components/app-sidebar'
import { Container, Main, Section } from '#/components/craft'
import { Button } from '#/components/ui/button'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { Tooltip, TooltipTrigger, TooltipContent } from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import { authGuard } from '#/server/auth-guard'
import { createFileRoute, Outlet, useMatch, useRouterState } from '@tanstack/react-router'
import { Construction } from 'lucide-react'

export const Route = createFileRoute('/_platform')({
  component: RouteComponent,
  beforeLoad: async () => {
    await authGuard()
  },
})

function RouteComponent() {
  const routerState = useRouterState()

  const matched = useMatch({
    from: "/_platform/_orchestra/analytics",
    shouldThrow: false
  })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Main>
          <Section className="p-4!">
            <Container className="p-0! flex">
              <div className="capitalize flex items-center gap-2">
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
                  <div className='p-1 bg-muted flex items-center justify-center gap-4 rounded-lg'>
                    <div className='grid items-start'>
                      <span className='text-xs font-light text-muted-foreground'>Balance</span>
                      <span className='text-sm font-semibold text-primary'>$1200000000</span>
                    </div>
                    <Button size="sm" variant="default">Request payout</Button>
                  </div>
                )}
              </div>
            </Container>
          </Section>
          <Section className="p-4!">
            <Container className="p-0!">
              <Outlet />
            </Container>
          </Section>
        </Main>
      </SidebarInset>
    </SidebarProvider>
  )
}
