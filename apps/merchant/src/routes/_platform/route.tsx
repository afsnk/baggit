import { AppSidebar } from '#/components/app-sidebar'
import { Container, Main, Section } from '#/components/craft'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { authGuard } from '#/server/auth-guard'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform')({
  component: RouteComponent,
  beforeLoad: async () => {
    await authGuard()
  },
})

function RouteComponent() {
  const routerState = useRouterState()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Main>
          <Section className="p-4!">
            <Container className="p-0!">
              <div className="capitalize">
                {routerState.location.pathname.slice(1)}
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
