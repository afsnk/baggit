import {
  createFileRoute,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import ExchangeCard from './-components/exchange-card'
import { Button } from '#/components/ui/button'
import { KYCModal } from './-components/kyc.modal'
import { searchQuery } from './-entities/query'
import { useTrade } from './-hooks/use-trade'
import { useEffect } from 'react'

export const Route = createFileRoute('/_main/sell')({
  component: RouteComponent,
  validateSearch: searchQuery,
  errorComponent: SellErrorFallback,
})

function RouteComponent() {
  const { layout } = Route.useSearch()
  const { tradeState, tradeError, setMode } = useTrade()

  useEffect(() => {
    setMode('sell')
  }, [])

  return (
    <div className="w-full grid gap-4">
      <ExchangeCard defaultMode="sell" layout={layout} />
      <KYCModal>
        <Button variant="default" size="lg" className="w-full my-6">
          Proceed to Sell
        </Button>
      </KYCModal>
    </div>
  )
}

function SellErrorFallback({ error, reset }: ErrorComponentProps) {
  return (
    <div>
      <p>Failed to load sell items: {error.message}</p>
      {/* TanStack Start provides a built-in reset callback */}
      <button onClick={() => reset()}>Try Again</button>
    </div>
  )
}
