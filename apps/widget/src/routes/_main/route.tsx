import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { ArrowLeft, Home, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Container, Main, Section } from '#/components/craft'
import { TradeProvider } from './-hooks/use-trade'

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main className="sm:w-sm mx-2 sm:mx-0 w-full">
      <Section className="sm:-translate-y-12">
        <Container className="bg-muted h-auto rounded-lg p-3 sm:p-3 md:relative">
          <TradeProvider>
            <Navigation />
            <Outlet />
          </TradeProvider>
        </Container>
      </Section>
    </Main>
  )
}

function Navigation() {
  const router = useRouter()
  const routerstate = useRouterState()
  // const navigate = useNavigate()
  if (routerstate.location.pathname === '/') return null
  return (
    <div className="w-full flex justify-between p-2">
      <div>
        <span className="text-sm font-black">💰 Baggit</span>
      </div>
      <MainMenu />
    </div>
  )
}

function MainMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="max-w-sm flex items-center justify-between"
        >
          <span className="text-xs font-semibold">Menu</span>
          <IconBurger className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 text-xs" align="center">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            General
          </DropdownMenuLabel>
          <DropdownMenuItem>Transactions</DropdownMenuItem>
          <DropdownMenuItem>Saved addresses</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            Settings
          </DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Link wallet</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const IconBurger = ({ className }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(
      'icon icon-tabler icons-tabler-outline icon-tabler-burger',
      className,
    )}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 15h16a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4" />
    <path d="M12 4c3.783 0 6.953 2.133 7.786 5h-15.572c.833 -2.867 4.003 -5 7.786 -5" />
    <path d="M5 12h14" />
  </svg>
)
