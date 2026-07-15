import AnalyticsTable from '#/components/analytics-table'
import Bar from '#/components/charts/bar'
import BarChart from '#/components/charts/bar-chart'
import BarXAxis from '#/components/charts/bar-x-axis'
import Grid from '#/components/charts/grid'
import { Legend, LegendItem, LegendLabel, LegendMarker, LegendValue } from '#/components/charts/legend'
import PieCenter from '#/components/charts/pie-center'
import PieChart from '#/components/charts/pie-chart'
import PieSlice from '#/components/charts/pie-slice'
import { ChartTooltip } from '#/components/charts/tooltip'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { ScrollArea, ScrollBar } from '#/components/ui/scroll-area'
import { getTransactions } from '#/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

// const data = [
//   { date: new Date("2026-01-01"), usdt: 1, usdc: 3, cngn: 0 },
//   { date: new Date("2026-03-18"), usdt: 12, usdc: 930, cngn: 400 },
//   { date: new Date("2026-05-08"), usdt: 310, usdc: 3040, cngn: 1400 },
//   { date: new Date(), usdt: 200, usdc: 30, cngn: 2100 },
// ];

const pieData = [
  { label: "USDT", value: 4250, color: "#0ea5e9" },
  { label: "USDC", value: 3120, color: "#a855f7" },
  { label: "CNGN", value: 2100, color: "#f59e0b" },
];

export const Route = createFileRoute('/_platform/_orchestra/analytics')({
  beforeLoad: () => ({isUnderConstruction: true}),
  component: RouteComponent,
})

function RouteComponent() {
  // const {data: activeOrg} = authClient.useActiveOrganization()
  const { data: transactionData, isLoading } = useQuery(getTransactions)

  const computedBarChartData = transactionData?.map((trx) => ({
    date: new Intl.DateTimeFormat('en-US', {dateStyle: "medium"}).format(new Date(trx.date!)),
    'usdt': (trx as unknown as { payment: any }).payment.currency === 'usdt'? ((trx as unknown as { payment: any }).payment?.amount * (trx as unknown as { payment: any }).payment?.rate) : 0,
    'usdc': (trx as unknown as { payment: any }).payment.currency === 'usdc'? ((trx as unknown as { payment: any }).payment?.amount * (trx as unknown as { payment: any }).payment?.rate) : 0,
    'ngn': (trx as unknown as { payment: any }).payment.currency === 'ngn'? (trx as unknown as { payment: any }).payment?.amount : 0,
  }))

  const computedPieChartdata = [
    { label: "USDT", value: computedBarChartData?.reduce((prev, curr) => prev + curr['usdt'], 0) || 0, color: "#0ea5e9" },
    { label: "USDC", value: computedBarChartData?.reduce((prev, curr) => prev + curr['usdc'], 0) || 0, color: "#a855f7" },
    { label: "CNGN", value: computedBarChartData?.reduce((prev, curr) => prev + curr['ngn'], 0) || 0, color: "#f59e0b" },
  ]

  return (
    <div className='grid gap-6'>
      <div className='max-h-62.5 h-full grid relative group border border-green-400'>
        <h4 className='absolute font-semibold text-muted-foreground group-hover:text-primary transition z-50'>Revenue accross currencies</h4>
        <BarChart
          data={computedBarChartData || []}
          xDataKey="date"
          status={isLoading ? 'loading' : 'ready'}
          className='max-w-min'
        >
          <Grid horizontal shimmer />
          <Bar dataKey="usdt" fill="var(--color-chart-3)" lineCap="round" />
          <Bar
            dataKey="usdc"
            fill="var(--color-chart-1)"
            lineCap="round"
          />
          <Bar
            dataKey="ngn"
            fill="var(--chart-line-secondary)"
            lineCap="round"
          />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Card className=''>
          <CardHeader>
            <CardTitle className='text-sm font-semibold flex items-center gap-2'>
              Widget revenue <Badge>Last 7 days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='flex w-full items-center justify-start gap-6'>
            <PieChart data={computedPieChartdata} size={180} innerRadius={40} padAngle={.12} cornerRadius={5}>
              {computedPieChartdata.map((_, index) => (
                <PieSlice key={index} index={index} />
              ))}
              <PieCenter defaultLabel='Total' prefix='₦' />
            </PieChart>
            <Legend items={computedPieChartdata} title="Revenue" titleClassName='text-sm! font-semibold! my-0!'>
              <LegendItem className='flex items-center gap-2'>
                <LegendMarker />
                <LegendLabel className='flex-1 text-xs text-muted-foreground' />
                <LegendValue />
              </LegendItem>
            </Legend>
          </CardContent>
        </Card>
        <Card className=''>
          <CardHeader>
            <CardTitle className='text-sm font-semibold flex items-center gap-2'>
              Checkout revenue <Badge>Last 7 days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='flex w-full items-center justify-start gap-6'>
            <PieChart data={pieData} size={150} innerRadius={30} padAngle={.12} cornerRadius={5}>
              {pieData.map((_, index) => (
                <PieSlice key={index} index={index} />
              ))}
              <PieCenter defaultLabel='Total' prefix='₦' />
            </PieChart>
            <Legend items={pieData} title="Revenue" titleClassName='text-sm! font-semibold! my-0!'>
              <LegendItem className='flex items-center gap-2'>
                <LegendMarker />
                <LegendLabel className='flex-1 text-xs text-muted-foreground' />
                <LegendValue />
              </LegendItem>
            </Legend>
          </CardContent>
        </Card>
      </div>

      <AnalyticsTable data={transactionData || []} />
    </div>
  )
}
