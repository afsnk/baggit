import { cn } from '#/lib/utils'
import React from 'react'
import { Portal, PortalBackdrop } from '#/components/ui/portal'
import { Button } from '#/components/ui/button'
import { mainNavLinks } from '#/components/nav-links'
import { LinkItem } from '#/components/sheard'
import { XIcon, MenuIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <div className="lg:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="lg:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        <div
          className={cn(
            'transition-all',
            open ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
          )}
        >
          <XIcon />
        </div>
        <div
          className={cn(
            'absolute transition-all',
            open ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
          )}
        >
          <MenuIcon />
        </div>
      </Button>
      {open && (
        <Portal className="top-14">
          <PortalBackdrop />
          <div
            className={cn(
              'size-full overflow-y-auto p-4',
              'data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in',
            )}
            data-slot={open ? 'open' : 'closed'}
          >
            <div className="flex w-full flex-col gap-y-2">
              {mainNavLinks.map((nav, i) => (
                <React.Fragment key={`${nav.label}-item-${i}`}>
                  <span className="text-sm">{nav.label}</span>
                  <div className="rounded-xl grid grid-cols-2 gap-2 p-1 border bg-popover shadow">
                    {nav.subItems &&
                      nav.subItems.map((link, i) => (
                        <Link
                          to={link.href}
                          onClick={closeMenu}
                          className={cn(
                            'rounded-lg p-2 active:bg-muted dark:active:bg-muted/50',
                            {
                              'col-span-2': i === 0,
                            },
                          )}
                          key={`product-${link.label}`}
                        >
                          <LinkItem iconClassName="size-10" {...link} />
                        </Link>
                      ))}
                  </div>
                </React.Fragment>
              ))}
              <span className="text-sm">Products</span>
              <Link
                className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
                to="/billing"
                onClick={closeMenu}
              >
                <span className="font-medium">Billing/Deposit</span>
                <span className="line-clamp-2 text-muted-foreground text-xs">
                  Handle billing, subscriptions, make onboarding super seamless.
                </span>
              </Link>
              <Link
                to="/rewards"
                onClick={closeMenu}
                className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
              >
                <span className="font-medium">Rewards</span>
                <span className="line-clamp-2 text-muted-foreground text-xs">
                  Monitize your users' loyalty with rewards and incentives.
                </span>
              </Link>
              <Link
                to="/referral"
                onClick={closeMenu}
                className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
              >
                <span className="font-medium">
                  Turn your network into recurring revenue
                </span>
                <span className="line-clamp-2 text-muted-foreground text-xs">
                  Earn commissions by referring partners and user to our
                  products.
                </span>
              </Link>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                className="w-full"
                variant="secondary"
                onClick={closeMenu}
              >
                Documentaion
              </Button>
              <Button className="w-full" onClick={closeMenu} asChild>
                <Link to="/onboarding">Get Started</Link>
              </Button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
