import { Container, Section } from '#/components/craft'
import CryptoSale from '#/components/crypto.sale'
import { getTokenData } from '#/lib/fetch-client'
import type { Asset } from '#/lib/types'
import { icons } from '#/lib/utils'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/buy/$asset')({
  component: RouteComponent,
  staleTime: 10_000,
  gcTime: 10_000, // Keep for 10 seconds
  beforeLoad: ({ params }) => {
    return getTokenData({ data: params.asset as Asset })
  },
  loader: ({ context }) => context.data,
  params: {
    parse: (params) => ({
      asset: params.asset as Asset,
    }),
  },
})

function RouteComponent() {
  const asset = useParams({
    from: '/buy/$asset',
    select: (props) => props.asset as Exclude<Asset, 'crypto'>,
  })

  return (
    <Section>
      <Container>
        <CryptoSale
          token={asset === 'usdt' ? 'USD Tether' : 'USDC'}
          symbol={asset}
          icon={icons[asset]}
          action="buy"
        />
      </Container>
    </Section>
  )
}
