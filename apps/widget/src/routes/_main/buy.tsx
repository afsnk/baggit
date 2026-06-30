import { createFileRoute } from '@tanstack/react-router'
import ExchangeCard from './-components/exchange-card'
import { Button } from '#/components/ui/button'
import { searchQuery } from './-entities/query'
import { useTrade } from './-hooks/use-trade'
import { useEffect } from 'react'

export const Route = createFileRoute('/_main/buy')({
  component: RouteComponent,
  validateSearch: searchQuery,
})

function RouteComponent() {
  const { layout } = Route.useSearch()
  const { tradeState, tradeError, setMode } = useTrade()

  useEffect(() => {
    setMode('buy')
  }, [])

  return (
    <div className="w-full grid gap-4">
      <ExchangeCard defaultMode="buy" layout={layout} />

      <Button variant="default" size="lg" className="w-full my-6">
        Proceed to Buy
      </Button>
    </div>
  )
}
