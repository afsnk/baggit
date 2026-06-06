import { createFileRoute } from '@tanstack/react-router'
import ExchangeCard from './-components/exchange-card'
import { Button } from '#/components/ui/button'
import { KYCModal } from './-components/kyc.modal'

export const Route = createFileRoute('/_main/buy')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full grid gap-4">
      <ExchangeCard defaultMode="buy" />
      <KYCModal>
        <Button variant="default" size="lg" className="w-full my-6">
          Proceed to Buy
        </Button>
      </KYCModal>
    </div>
  )
}
