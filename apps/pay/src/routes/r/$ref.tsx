import { PaymentPage } from '#/components/payment-page'
import { fetch } from '#/lib/api-client'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const paymentSearchSchema = z.object({
  merchantName: z.string().optional().default('Ugamy'),
  merchantCallbackUrl: z.string().optional().default('https://ugamy.io/pay'),
  pk: z.string().optional(),
  mode: z.enum(['test', 'prod']).optional(),
})

type PaymentSearch = z.infer<typeof paymentSearchSchema>

export const Route = createFileRoute('/r/$ref')({
  component: RouteComponent,
  validateSearch: paymentSearchSchema,
  async loader(props) {
    const reference = props.params.ref
    const search = props.location.search as PaymentSearch
    console.log(`props`, { reference, search })
    // Load default merchant data from transaction reference

    const { data, error } = await fetch(`/payment/:id`, {
      method: 'GET',
      params: {
        id: reference,
      },
      headers: {
        'baggit-public-key': search.pk,
      },
    })

    if (error) {
      console.log(`Error fetching payment`, { error })
      throw error
    }

    console.log(`Pay details`, { data })
    const paymentData = data as any

    return { ...paymentData, pk: search.pk }
  },
})

function RouteComponent() {
  const { ref } = Route.useParams()
  const data = Route.useLoaderData()

  const { merchantCallbackUrl, merchantName } = Route.useSearch()
  console.log(`Payment Reference`, { ref, merchantCallbackUrl, merchantName })

  return (
    <PaymentPage
      merchantCallbackUrl={data.callbackUrl || merchantCallbackUrl}
      merchantName={data.metadata?.merchantName || merchantName}
      amount={data.amount}
      pk={data.pk}
      paymentId={ref}
    />
  )
}
