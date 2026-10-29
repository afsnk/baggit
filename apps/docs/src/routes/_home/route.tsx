import { createFileRoute, Outlet } from '@tanstack/react-router'
import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';

export const Route = createFileRoute('/_home')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        {
          type: 'custom',
          // only displayed on navbar, not mobile menu
          on: 'nav',
          children: (
            <NavbarMenu>
              <NavbarMenuTrigger>Documentation</NavbarMenuTrigger>
              <NavbarMenuContent>
                <NavbarMenuLink href="/introduction">Introduction</NavbarMenuLink>
              </NavbarMenuContent>
            </NavbarMenu>
          ),
        },
        // other items
      ]}
    >
      <Outlet />
      <footer className='flex w-full items-center justify-center py-4 border-t border-gray-400/30 text-xs'>
        ©{new Date().getUTCFullYear()} Baggit Innovations Inc, All rights reserved
      </footer>
    </HomeLayout>
  )
}
