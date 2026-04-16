import { Container, Section } from '#/components/craft'
import CryptoSale from '#/components/crypto.sale'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/buy/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Section>
      <Container>
        <CryptoSale
          token="USD Tether"
          symbol="USDT"
          icon="/logo512.png"
          action="buy"
        />
      </Container>
    </Section>
  )
}
