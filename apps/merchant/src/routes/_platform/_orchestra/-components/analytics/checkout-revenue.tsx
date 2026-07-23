import { Legend, LegendItem, LegendLabel, LegendMarker, LegendValue } from "#/components/charts/legend";
import PieCenter from "#/components/charts/pie-center";
import PieChart from "#/components/charts/pie-chart";
import PieSlice from "#/components/charts/pie-slice";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useIsMobile } from "#/hooks/use-mobile";
import type { Transaction } from "@baggit/api/app";


export default function CheckoutRevenuePieChart({ transactionData }: {transactionData?: Transaction[]}) {
	const computedData = transactionData?.map((trx) => ({
    date: new Intl.DateTimeFormat('en-US', {dateStyle: "medium"}).format(new Date(trx.createdAt!)),
    'usdt': (trx as unknown as { payment: any }).payment.currency === 'usdt'? ((trx as unknown as { payment: any }).payment?.amount * (trx as unknown as { payment: any }).payment?.rate) : 0,
    'usdc': (trx as unknown as { payment: any }).payment.currency === 'usdc'? ((trx as unknown as { payment: any }).payment?.amount * (trx as unknown as { payment: any }).payment?.rate) : 0,
    'ngn': (trx as unknown as { payment: any }).payment.currency === 'ngn'? (trx as unknown as { payment: any }).payment?.amount : 0,
  }))
	const computedPieChartdata = [
    { label: "USDT", value: computedData?.reduce((prev, curr) => prev + curr['usdt'], 0) || 0, color: "#0ea5e9" },
    { label: "USDC", value: computedData?.reduce((prev, curr) => prev + curr['usdc'], 0) || 0, color: "#a855f7" },
    { label: "CNGN", value: computedData?.reduce((prev, curr) => prev + curr['ngn'], 0) || 0, color: "#f59e0b" },
  ]

	return (
		<Card>
      <CardHeader>
        <CardTitle className='text-sm font-semibold flex items-center gap-2'>
          Checkout revenue <Badge>Last 7 days</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='flex w-full items-center justify-start gap-6'>
        <PieChart data={computedPieChartdata} size={150} innerRadius={35} padAngle={.12} cornerRadius={5}>
          {computedPieChartdata.map((_, index) => (
            <PieSlice key={index} index={index} />
          ))}
          <PieCenter defaultLabel='Total' prefix='₦' labelClassName='text-xs' />
        </PieChart>
        {!useIsMobile() && <Legend items={computedPieChartdata} title="Revenue" titleClassName='text-sm! font-semibold! my-0!'>
          <LegendItem className='flex items-center gap-2'>
            <LegendMarker />
            <LegendLabel className='flex-1 text-xs text-muted-foreground' />
            <LegendValue />
          </LegendItem>
        </Legend>}
      </CardContent>
    </Card>
	)
}
