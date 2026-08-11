import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible.tsx'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '#/components/ui/sidebar.tsx'
import { Link, useMatchRoute, useRouterState } from '@tanstack/react-router'
import { useIsMobile } from '#/hooks/use-mobile'
import { useEffect, useState } from 'react'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const match = useMatchRoute()
  const sidebar = useSidebar()
  const [activeTitle, setActiveTitle] = useState('')
  const isMObile = useIsMobile()

  const routerState = useRouterState()

  useEffect(() => {
    const currentUrl = routerState.location.pathname
    for (const item of items) {
      if (item.items?.some((i) => i.url.includes(currentUrl))) {
        setActiveTitle(item.title)
        break
      }
    }
  }, [routerState])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => (
          <Collapsible
            key={item.url + index}
						asChild
						open={activeTitle === item.title}
            // defaultOpen={activeTitle.toLowerCase() === item.title.toLowerCase()}
						className="group/collapsible"
						onClick={() => {
							setActiveTitle(item.title)
						}}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => {
                    useRouterState({
                      select: (s) =>
                        s.matches.some((m) => m.routeId === subItem.url),
                    })
                    return (
                      <SidebarMenuSubItem
                        key={subItem.title}
                        onClick={() => {
                          if (isMObile) {
                            sidebar.toggleSidebar()
                          }
                        }}
                      >
                        <SidebarMenuSubButton
                          asChild
                          isActive={!!match({ to: subItem.url })}
                        >
                          <Link to={subItem.url} preload="intent">
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
