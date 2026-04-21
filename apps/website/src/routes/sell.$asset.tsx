import { Container, Section } from '#/components/craft'
import CryptoSale from '#/components/crypto.sale'
import { getTokenData } from '#/lib/fetch-client'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/sell/$asset')({
  component: RouteComponent,
  staleTime: 10_000,
  gcTime: 10_000, // Keep for 10 seconds
  beforeLoad: ({ params }) => {
    console.log('Params', { params })
    return getTokenData({ data: params.asset })
  },
  loader: ({ context }) => context.data,
})

function RouteComponent() {
  const { asset } = useParams({ from: '/sell/$asset' })

  const [icon, setIcon] = useState<string | undefined>(undefined)
  useEffect(() => {
    switch (asset) {
      case 'usdt':
        setIcon(`/assets/token/usdt.svg`)
        break
      case 'usdc':
        setIcon(`/assets/token/usdc.png`)
        break
      case 'bitcoin':
        setIcon(`/assets/token/bitcoin.svg`)
        break
      case 'solana':
        setIcon(`/assets/token/solana.svg`)
        break
      default:
        setIcon(undefined)
    }
  }, [asset])

  return (
    <Section>
      <Container>
        <CryptoSale
          token={asset === 'usdt' ? 'USD Tether' : 'USDC'}
          symbol={asset}
          icon={icon}
          action="sell"
        />
      </Container>
    </Section>
  )
}
