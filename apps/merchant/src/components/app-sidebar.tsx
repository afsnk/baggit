'use client'

import * as React from 'react'
import {
  ExternalLink,
  Music2,
  Settings2,
  SquareTerminal,
} from 'lucide-react'

import { NavMain } from '#/components/nav-main.tsx'
import { NavDocumentation } from '#/components/nav-documentation'
import { NavUser } from '#/components/nav-user.tsx'
import { OrgSwitcher } from '#/components/org-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '#/components/ui/sidebar.tsx'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Orchestra',
      url: '#',
      icon: Music2,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/overview',
        },
        {
          title: 'Analytics',
          url: '/analytics',
        },
        {
          title: 'Audit Logs',
          url: '/audit-logs',
        },
      ],
    },
    {
      title: 'Developer',
      url: '#',
      icon: SquareTerminal,
      items: [
        {
          title: 'API Keys',
          url: '/developer/api-keys',
        },
        {
          title: 'Configuration',
          url: '/developer/configuration',
        },
        {
          title: 'Observability',
          url: '/developer/observability',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/settings/general',
        },
        {
          title: 'Team',
          url: '/settings/team',
        },
        // {
        //   title: 'Limits',
        //   url: '/settings/limits',
        // },
      ],
    },
  ],
  docs: [
    {
      name: 'Widget Docs',
      url: 'https://docs.baggit.link/widget',
      icon: ExternalLink,
    },
    {
      name: 'Checkout Docs',
      url: 'https://docs.baggit.link/checkout',
      icon: ExternalLink,
    },
    {
      name: 'Subscriptions Docs',
      url: 'https://docs.baggit.link/subscriptions',
      icon: ExternalLink,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocumentation projects={data.docs} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
