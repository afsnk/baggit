import { Container, Main, Section } from '#/components/craft'
import { CardSpotlight } from '#/components/ui/card-spotlight';
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_home/')({ component: Home })

const links: Array<{ label: string; description: string; url: string; }> = [
  {
    label: "Checkout",
    description: "Seamlessly allow payments for goods and services, with modern payment options, and fast payout",
    url: "/checkout"
  },
  {
    label: "Widget",
    description: "Enable users, onboard, buy/sell assets directly in your application without zero hasle integration",
    url: "/widget"
  },
  {
    label: "Subscription",
    description: "Collect recurring payments without worry, turn on and forget with a reliable infra that keeps going",
    url: "/subscription"
  }
]

function Home() {
  return (
    <Main>
      <Section>
        <Container className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {links.map((link) => (
            <Link to={link.url} preload="intent" className='w-full md:last:col-span-2 no-underline!'>
              <CardSpotlight className="w-full no-underline! group">
                <h4>{link.label}</h4>
                <span className='font-light text-sm text-primary'>{link.description}</span>
              </CardSpotlight>
            </Link>
          ))}
        </Container>
      </Section>
    </Main>
  )
}
