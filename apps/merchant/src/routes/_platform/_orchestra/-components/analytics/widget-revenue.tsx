import { Legend, LegendItem, LegendLabel, LegendMarker, LegendValue } from "#/components/charts/legend";
import PieCenter from "#/components/charts/pie-center";
import PieChart from "#/components/charts/pie-chart";
import PieSlice from "#/components/charts/pie-slice";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useIsMobile } from "#/hooks/use-mobile";

const pieData = [
  { label: "USDT", value: 0, color: "#0ea5e9" },
  { label: "USDC", value: 0, color: "#a855f7" },
  { label: "CNGN", value: 0, color: "#f59e0b" },
];

export default function WidgetRevenuePieChart() {
	return (
		<Card>
      <CardHeader>
        <CardTitle className='text-sm font-semibold flex items-center gap-2'>
          Widget revenue <Badge>Last 7 days</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='flex w-full items-center justify-start gap-6'>
        <PieChart data={pieData} size={180} innerRadius={40} padAngle={.12} cornerRadius={5}>
          {pieData.map((_, index) => (
            <PieSlice key={index} index={index} />
          ))}
          <PieCenter defaultLabel='Total' prefix='₦' />
        </PieChart>
        {!useIsMobile() && <Legend items={pieData} title="Revenue" titleClassName='text-sm! font-semibold! my-0!'>
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
