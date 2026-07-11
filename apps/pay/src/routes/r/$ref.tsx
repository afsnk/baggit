import { PaymentPage } from '#/components/payment-page'
import { fetch } from '#/lib/api-client'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const paymentSearchSchema = z.object({
  merchantName: z.string().optional().default('Ugamy'),
  merchantCallbackUrl: z.string().optional().default('https://ugamy.io/pay'),
  email: z.email(),
  name: z.string(),
  mode: z.enum(['test', 'prod']).optional(),
})

type PaymentSearch = z.infer<typeof paymentSearchSchema>

export const Route = createFileRoute('/r/$ref')({
  component: RouteComponent,
  validateSearch: paymentSearchSchema,
  // async beforeLoad({search, params}) {
  //   await authGuard({
  //     data: {
  //       ...search,
  //       invoiceRef: params.ref,
  //     }
  //   })
  // },
  async loader(props) {
    try {
      const reference = props.params.ref
      const search = props.location.search as PaymentSearch
      console.log(`props`, { reference, search })

      const { data, error } = await fetch(`/v1/payment/:invoiceRef`, {
        method: 'GET',
        params: {
          invoiceRef: reference,
        }
      })

      if (error) {
        console.log(`Error fetching payment`, { error })
        throw error
      }

      console.log(`Pay details`, { data })
      const paymentData = data

      return { ...paymentData}
    }
    catch (error: any) {
      console.log(`[checkout] Error getting payments`, {error})
    }
  },
})

function RouteComponent() {
  const { ref } = Route.useParams()
  const data = Route.useLoaderData()

  const { merchantCallbackUrl, merchantName } = Route.useSearch()
  console.log(`Payment Reference`, { ref, merchantCallbackUrl, merchantName })

  return (
    <PaymentPage
      merchantCallbackUrl={data.payments[0].callbackUrl || merchantCallbackUrl}
      merchantName={data.metadata.merchantName || merchantName}
      amount={data.amount}
      paymentId={data.payments[0].id}
      orgId={data.orgId}
    />
  )
}
