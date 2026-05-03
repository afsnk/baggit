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

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="px-0 items-center">
      <div className="max-w-xl md:max-w-lg w-full bg-muted min-h-[450px] h-screen md:h-auto rounded-lg mx-auto md:my-6 p-4">
        <Navigation />
        <Outlet />
      </div>
    </main>
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
          className="max-w-sm flex items-center justify-between gap-6"
        >
          <span>Menu</span>
          <IconBurger className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 text-xs" align="center">
        <DropdownMenuGroup>
          <DropdownMenuItem>Payment history</DropdownMenuItem>
          <DropdownMenuItem>Saved addresses</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuItem>Theme</DropdownMenuItem>
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
