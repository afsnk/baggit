'use client'

import {
  Copy,
  ExternalLink,
  Folder,
  Forward,
  MessageCircleCode,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '#/components/ui/sidebar.tsx'

export function NavDocumentation({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documentation</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} target="_blank">
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem>
                  <ExternalLink className="text-muted-foreground" />
                  <span>Open docs</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="text-muted-foreground" />
                  <span>Copy prompt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-amber-600 group/dropdown">
                  <MessageCircleCode className="text-amber-600 group-hover/dropdown:text-primary" />
                  <span>Ask assistant</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {/*<SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>*/}
      </SidebarMenu>
    </SidebarGroup>
  )
}
