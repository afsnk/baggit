import { Container, Section } from '#/components/craft'
import CryptoSale from '#/components/crypto.sale'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sell/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Section>
      <Container>
        <CryptoSale token="Crypto" symbol="crypto" action="sell" />
      </Container>
    </Section>
  )
}
