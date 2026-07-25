import Bar from '#/components/charts/bar'
import BarChart from '#/components/charts/bar-chart'
import BarXAxis from '#/components/charts/bar-x-axis'
import Grid from '#/components/charts/grid'
import ChartTooltip from '#/components/charts/tooltip/chart-tooltip'
import type { Transaction } from '@baggit/api/app'

export default function CrossRevenueBarChart({
  transactionData,
  isLoading,
}: {
  transactionData?: Transaction[]
  isLoading: boolean
}) {
  const computedBarChartData = transactionData?.map((trx) => ({
    date: new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
      new Date(trx.createdAt!),
    ),
    usdt:
      (trx as unknown as { payment: any }).payment.currency === 'usdt'
        ? (trx as unknown as { payment: any }).payment?.amount *
          (trx as unknown as { payment: any }).payment?.rate
        : 0,
    usdc:
      (trx as unknown as { payment: any }).payment.currency === 'usdc'
        ? (trx as unknown as { payment: any }).payment?.amount *
          (trx as unknown as { payment: any }).payment?.rate
        : 0,
    ngn:
      (trx as unknown as { payment: any }).payment.currency === 'ngn'
        ? (trx as unknown as { payment: any }).payment?.amount
        : 0,
  }))

  return (
    <>
      <h4 className="absolute font-semibold text-muted-foreground group-hover:text-primary transition z-50">
        Revenue accross currencies
      </h4>
      <BarChart
        data={computedBarChartData || []}
        xDataKey="date"
        status={isLoading ? 'loading' : 'ready'}
        className="h-full"
      >
        <Grid horizontal shimmer />
        <Bar dataKey="usdt" fill="var(--color-chart-3)" lineCap="round" />
        <Bar dataKey="usdc" fill="var(--color-chart-1)" lineCap="round" />
        <Bar dataKey="ngn" fill="var(--chart-line-secondary)" lineCap="round" />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
    </>
  )
}
