import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '#/components/ui/navigation-menu'
import { mainNavLinks } from '#/components/nav-links'
import { LinkItem } from '#/components/sheard'
import { Badge } from './ui/badge'

export function DesktopNav() {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {mainNavLinks.map((nav, i) => (
          <NavigationMenuItem
            className="bg-transparent"
            key={`nav-${nav.label}-${i}`}
          >
            <NavigationMenuTrigger className="bg-transparent">
              {nav.icon} {nav.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-muted/50 p-1 pr-1.5 pb-1.5 dark:bg-background">
              <div className="grid grid-cols-[3fr,auto,auto] gap-y-3.5">
                <NavigationMenuLink
                  key={`item-${nav?.subItems[0].label}`}
                  href={nav?.subItems[0].href}
                  className="p-2"
                >
                  <LinkItem {...nav?.subItems[0]} />
                </NavigationMenuLink>
                <div className="rounded-sm grid w-lg grid-cols-2 gap-2 border bg-popover shadow">
                  {nav.subItems &&
                    nav.subItems.slice(1).map((item, i) => (
                      <NavigationMenuLink
                        key={`item-${item.label}-${i}`}
                        href={item.href}
                      >
                        <LinkItem {...item} iconClassName="size-10" />
                      </NavigationMenuLink>
                    ))}
                </div>
              </div>
              {/*<div className="p-2">
                <p className="text-muted-foreground text-sm">
                  Having isues?{' '}
                  <a
                    className="font-medium text-foreground hover:underline"
                    href="#"
                  >
                    Reach out on telegram
                  </a>
                </p>
              </div>*/}
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">
            Products
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-muted/50 p-1 pr-1.5 pb-1.5 dark:bg-background">
            <div className="grid w-lg grid-cols-2 gap-2">
              <div className="space-y-2 bg-popover">
                <NavigationMenuLink href="/billing" className="p-4">
                  <span className="font-medium">Billing/Deposit</span>
                  <span className="line-clamp-2 text-muted-foreground text-xs">
                    Handle billing, subscriptions, make onboarding super
                    seamless.
                  </span>
                </NavigationMenuLink>
              </div>
              <div className="bg-popover relative inline-flex">
                <NavigationMenuLink href="#" className="p-4">
                  <span className="font-medium">Rewards</span>
                  <span className="line-clamp-2 text-muted-foreground text-xs">
                    Monitize your users' loyalty with rewards and incentives.
                  </span>
                </NavigationMenuLink>
                <Badge className="absolute top-2 right-2" variant="destructive">
                  Coming soon...
                </Badge>
              </div>
              <div className="space-y-2 bg-popover col-span-2">
                <NavigationMenuLink href="/referral" className="px-4 py-6">
                  <span className="font-medium">
                    Turn your network into recurring revenue
                  </span>
                  <span className="line-clamp-2 text-muted-foreground text-xs">
                    Earn commissions by referring partners and user to our
                    products.
                  </span>
                </NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuLink asChild className="px-4">
          <a className="rounded-md p-2 hover:bg-accent" href="/docs">
            Documentation
          </a>
        </NavigationMenuLink>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
