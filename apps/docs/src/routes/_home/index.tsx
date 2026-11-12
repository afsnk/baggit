import { Main } from '#/components/craft'
import { createFileRoute } from '@tanstack/react-router'
import CheckoutSection from './-components/checkout-section';
import PayoutSection from './-components/payout-section';
import WidgetSection from './-components/widget-section';

export const Route = createFileRoute('/_home/')({ component: Home })

const links: Array<{ label: string; description: string; url: string; }> = [
  {
    label: "Checkout",
    description: "Seamlessly allow payments for goods and services, with modern payment options, and fast payout",
    url: "/checkout"
  },
  {
    label: "Payout",
    description: "Payout directly to users bank accounts",
    url: "/payout"
  },
  {
    label: "Widget",
    description: "Enable users, onboard, buy/sell assets directly in your application with zero hasle integration",
    url: "/widget"
  }
]

function Home() {
  return (
    <Main>
			<CheckoutSection />

			<PayoutSection />

			<WidgetSection />
    </Main>
  )
}
