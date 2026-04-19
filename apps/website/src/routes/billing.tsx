import { Container, Section } from '#/components/craft'
import { Integrations } from '#/components/integrations'
import PromptingIsAllYouNeed from '#/components/ui/animated-hero-section'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '#/components/ui/item'
import { IconRocket } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { Clock10, Globe, Link2, ScrollText, Webhook } from 'lucide-react'

export const Route = createFileRoute('/billing')({
  component: RouteComponent,
})

const iconSize = 'size-8'
const whyChooseUs: Array<{
  title: string
  description: string
  icon: React.ReactNode
}> = [
  {
    title: 'Instance confirmation',
    description:
      'Real-time payment status updates on-chain. No manual reconciliation needed.',
    icon: <Clock10 className={iconSize} />,
  },
  {
    title: 'Global Reach',
    description:
      'Accept crypto payments from any country. Settle in stablecoins or local fiat.',
    icon: <Globe className={iconSize} />,
  },
  {
    title: 'Trackable Status',
    description:
      'Monitor every stage of the payment. Know when a customer views or pays an invoice.',
    icon: <ScrollText className={iconSize} />,
  },
  {
    title: 'Webhook Notifications',
    description:
      'Get instant payment alerts. Automate your order fulfillment via our secure API.',
    icon: <Webhook className={iconSize} />,
  },
  {
    title: 'Shareable Link',
    description:
      'Generate unique payment links. Share via email, social apps, or embed in your site.',
    icon: <Link2 className={iconSize} />,
  },
  {
    title: 'New Features',
    description: 'More features and integration support in the works',
    icon: <IconRocket className={iconSize} />,
  },
]

function RouteComponent() {
  return (
    <Section>
      <Container className="relative h-[55vh] md:h-[70vh]">
        <PromptingIsAllYouNeed />
      </Container>
      <Container className="flex flex-col gap-6 p-4 mt-12">
        <h1 className="m-0!">Why choose Baggit?</h1>
        <span>
          Send trackable crypto invoices to your customers anywhere in the
          world.
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {whyChooseUs.map((why, i) => (
            <Item
              key={why.title}
              variant={i === whyChooseUs.length - 1 ? 'outline' : 'muted'}
            >
              <ItemHeader>{why.icon}</ItemHeader>
              <ItemContent>
                <ItemTitle>{why.title}</ItemTitle>
                <ItemDescription>{why.description}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
      </Container>
      <Container>
        <Integrations />
      </Container>
    </Section>
  )
}
