import { PaymentPage } from '#/components/payment-page'
import { fetch } from '#/lib/api-client'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Cloud } from 'lucide-react'
import { env } from '#/env'

const paymentSearchSchema = z.object({
  merchantName: z.string().optional().default('Ugamy'),
  merchantCallbackUrl: z.string().optional().default('https://ugamy.io/pay'),
  email: z.email(),
  name: z.string(),
  mode: z.enum(['test', 'prod']).optional(),
})

// type PaymentSearch = z.infer<typeof paymentSearchSchema>

export const Route = createFileRoute('/r/$ref')({
  component: RouteComponent,
  validateSearch: paymentSearchSchema,
  preload: true,
  staleTime: 120_000,
  gcTime: 0,
  shouldReload: true,
  loaderDeps: ({search}) => ({...search}),
  loader: async ({ params}) => {
    try {
      const ref = params.ref

      const { data: invoiceData, error } = await fetch(`/v1/payment/:invoiceRef`, {
        method: 'GET',
        params: {
          invoiceRef: ref,
        }
      })

      if (error) {
        console.log(`Error fetching payment`, { error })
        throw error
      }

      return { ...invoiceData}
    }
    catch (error: any) {
      console.log(`[checkout] Error getting payments`, { error })
      if (error?.name === 'HTTPError') {
        const res = error.response;
        const body = await res.text().catch(() => '<no body>');
        console.error('upstream failed', {
          url: `${env.VITE_API_URL}/v1/payment/${params.ref}`,
          status: res.status,
          body,
        });
      }
      return null;
    }
  }
})

function RouteComponent() {
  const { ref } = Route.useParams()
  const data = Route.useLoaderData()

  const { merchantCallbackUrl, merchantName } = Route.useSearch()
  console.log(`Payment Reference`, { ref, merchantCallbackUrl, merchantName })

  if (!data) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Cloud className='size-4' />
          </EmptyMedia>
          <EmptyTitle>Could not get invoice</EmptyTitle>
          <EmptyDescription>
            Refresh the page to try again, or contact support
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm">
            Contact support
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <PaymentPage
      merchantCallbackUrl={data.payments[0].callbackUrl || merchantCallbackUrl}
      merchantName={data.metadata.merchantName || merchantName}
      amount={data.amount}
      paymentId={data.payments[0].id}
      orgId={data.orgId}
      method={data.payments[0].method}
      exchangeRate={data.payments[0].rate}
      currency={data.payments[0].currency}
      reference={ref}
    />
  )
}
