import AnalyticsTable from '#/components/analytics-table'
import { clawfundsOptions, getTransactions } from '#/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import CheckoutRevenuePieChart from './-components/analytics/checkout-revenue'
import WidgetRevenuePieChart from './-components/analytics/widget-revenue'
import CrossRevenueBarChart from './-components/analytics/cross-revenue'

export const Route = createFileRoute('/_platform/_orchestra/analytics')({
  beforeLoad: () => ({isUnderConstruction: true}),
  component: RouteComponent,
})

function RouteComponent() {
  // const {data: activeOrg} = authClient.useActiveOrganization()
	const { data: transactionData, isLoading } = useQuery(getTransactions)
	useQuery(clawfundsOptions) // Triggers on page enter to any hanging transaction completed but not clawed to merchant address

  return (
    <div className='grid gap-6'>
      <div className='max-h-[35dvh] w-full h-full flex relative group'>
        <CrossRevenueBarChart transactionData={transactionData} isLoading={isLoading} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <WidgetRevenuePieChart />
        <CheckoutRevenuePieChart transactionData={transactionData} />
      </div>

      <AnalyticsTable data={transactionData || []} />
    </div>
  )
}
