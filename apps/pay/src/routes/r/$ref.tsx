import { PaymentPage } from '#/components/payment-page'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const paymentSearchSchema = z.object({
  merchantName: z.string().default('Ugamy'),
  merchantCallbackUrl: z.string().default('https://ugamy.io/pay'),
  mode: z.enum(['test', 'prod']).optional(),
})

type PaymentSearch = z.infer<typeof paymentSearchSchema>

export const Route = createFileRoute('/r/$ref')({
  component: RouteComponent,
  validateSearch: paymentSearchSchema,
  loader(props) {
    const reference = props.params.ref
    const search = props.location.search as PaymentSearch
    console.log(`props`, { reference, search })
    // Load default merchant data from transaction reference

    return {}
  },
})

function RouteComponent() {
  const { ref } = Route.useParams()
  const data = Route.useLoaderData()

  const { merchantCallbackUrl, merchantName } = Route.useSearch()
  console.log(`Payment Reference`, { ref, merchantCallbackUrl, merchantName })

  return (
    <PaymentPage
      merchantCallbackUrl={merchantCallbackUrl}
      merchantName={merchantName}
    />
  )
}
