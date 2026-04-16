import { Link } from '@tanstack/react-router'
// // import ParaglideLocaleSwitcher from './LocaleSwitcher.tsx'
// import ThemeToggle from './ThemeToggle'
import { Container, Main } from './craft.tsx'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '#/components/ui/navigation-menu'

export default function Header() {
  return (
    <Main>
      <header className="sticky top-0 z-50 bg-(--header-bg) px-4 backdrop-blur-lg">
        <Container className="flex items-center justify-center gap-x-3">
          <div className="min-w-[120px]">
            {/*<ParaglideLocaleSwitcher />

                <ThemeToggle />*/}
            <Link to="/">Baggit App</Link>
          </div>

          <div className="order-3 flex w-full items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Buy crypto</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <div className="h-full bg-accent p-4 rounded-md">
                        <ListItem
                          title="Buy crypto"
                          href="/buy"
                          className="h-full list-none"
                        >
                          <span>
                            Buy crypto easily with bank transfer and other
                            payment methods coming soon
                          </span>
                        </ListItem>
                      </div>
                      <div className="grid md:grid-cols-2">
                        {[
                          {
                            title: 'Buy USDC',
                            href: '/buy/usdc',
                            asset: 'USDC',
                          },
                          {
                            title: 'Buy USDT',
                            href: '/buy/usdt',
                            asset: 'USDT',
                          },
                          {
                            title: 'Buy cNGN',
                            href: '/buy/cngn',
                            asset: 'cNGN',
                          },
                          {
                            title: 'Buy Bitcoin',
                            href: '/buy/btc',
                            asset: 'Bitcoin',
                          },
                        ].map((item) => (
                          <ListItem
                            key={item.asset}
                            title={item.title}
                            href={item.href}
                          >
                            <span className="text-accent-foreground">
                              Bank transfer
                            </span>
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Sell crypto</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <div className="h-full bg-accent p-4 rounded-md">
                        <ListItem
                          title="Sell crypto"
                          href="/sell"
                          className="h-full list-none"
                        >
                          <span>
                            Sell crypto easily with competitive rates, instantly
                            receive funds
                          </span>
                        </ListItem>
                      </div>
                      <div className="grid md:grid-cols-2">
                        {[
                          {
                            title: 'Sell USDC',
                            href: '/sell/usdc',
                            asset: 'USDC',
                          },
                          {
                            title: 'Sell USDT',
                            href: '/sell/usdt',
                            asset: 'USDT',
                          },
                          {
                            title: 'Sell cNGN',
                            href: '/sell/cngn',
                            asset: 'cNGN',
                          },
                          {
                            title: 'Sell Bitcoin',
                            href: '/sell/btc',
                            asset: 'BTC',
                          },
                        ].map((item) => (
                          <ListItem
                            key={item.asset}
                            title={item.title}
                            href={item.href}
                          >
                            <span className="text-accent-foreground">
                              Nigerians only
                            </span>
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <div className="bg-accent p-4 rounded-md">
                        <ListItem
                          title="Billing/Deposit"
                          href="/payments"
                          className="h-full list-none"
                        >
                          <span>
                            Collect both one-time and recurring payments as well
                            as allow users deposit into your platform, make
                            onboarding super seamless.
                          </span>
                        </ListItem>
                      </div>
                      <div className="bg-accent p-4 rounded-md">
                        <ListItem
                          title="Rewards"
                          href="/rewards"
                          className="h-full list-none"
                        >
                          <span>
                            Improve customer acquisition by rewarding your most
                            loyal customers with partner discounts and lost
                            more, while earning comission.
                          </span>
                        </ListItem>
                      </div>
                      <div className="bg-accent p-4 rounded-md col-span-2">
                        <ListItem
                          title="Turn your network into recurring revenue"
                          href="/referral"
                          className="h-full list-none"
                        >
                          <span>
                            Earn commissions by referring partners and user to
                            our products
                          </span>
                        </ListItem>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </Container>
      </header>
    </Main>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <div {...props}>
      <NavigationMenuLink>
        <Link to={href}>
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            <div className="line-clamp-2 text-muted-foreground">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </div>
  )
}
