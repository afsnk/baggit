import {
  createFileRoute,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import ExchangeCard from './-components/exchange-card'
import { Button } from '#/components/ui/button'
import { KYCModal } from './-components/kyc.modal'

export const Route = createFileRoute('/_main/sell')({
  component: RouteComponent,
  errorComponent: SellErrorFallback,
})

function RouteComponent() {
  return (
    <div className="w-full grid gap-4">
      <ExchangeCard defaultMode="sell" />
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
