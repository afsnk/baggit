import { createFileRoute } from '@tanstack/react-router'
import ExchangeCard from './-components/exchange-card'
import { Button } from '#/components/ui/button'
import { KYCModal } from './-components/kyc.modal'
import { searchQuery } from './-entities/query'

export const Route = createFileRoute('/_main/buy')({
  component: RouteComponent,
  validateSearch: searchQuery,
})

function RouteComponent() {
  const { layout } = Route.useSearch()

  return (
    <div className="w-full grid gap-4">
      <ExchangeCard defaultMode="buy" layout={layout} />
      <KYCModal>
        <Button variant="default" size="lg" className="w-full my-6">
          Proceed to Buy
        </Button>
      </KYCModal>
    </div>
  )
}
