import Grid from '#/components/charts/grid'
import { Legend, LegendItem, LegendLabel, LegendMarker, LegendValue } from '#/components/charts/legend'
import LineChart, { Line } from '#/components/charts/line-chart'
import PieCenter from '#/components/charts/pie-center'
import PieChart from '#/components/charts/pie-chart'
import PieSlice from '#/components/charts/pie-slice'
import { ChartTooltip } from '#/components/charts/tooltip'
import { XAxis } from '#/components/charts/x-axis'
import { EmptyOrg } from '#/components/no-org'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from '#/components/ui/item'
import { ScrollArea } from '#/components/ui/scroll-area'
import { UnderConstruction } from '#/components/under-construction'
import { authClient } from '#/lib/auth-client'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BanknoteArrowUp, Building, CheckCircleIcon, Expand, Key, Loader2, LucideArrowUpRightSquare, Users2 } from 'lucide-react'

export const Route = createFileRoute('/_platform/_orchestra/overview')({
  component: RouteComponent,
  // loader: async () => {
  //   const { data: orgList, error } = await authClient.organization.list()

  //   if (error) {
  //     console.log(`Error listing orgs`, { error })
  //   }
  //   return orgList
  // },
})

const data = [
  { date: new Date("2026-01-01"), requests: 0 },
  { date: new Date("2026-03-18"), requests: 400 },
  { date: new Date("2026-05-08"), requests: 850 },
  { date: new Date(), requests: 11350 },
];

const pieData = [
  { label: "USDT", value: 4250, color: "#0ea5e9" },
  { label: "USDC", value: 3120, color: "#a855f7" },
  { label: "CNGN", value: 2100, color: "#f59e0b" },
];

function RouteComponent() {
  const { data: orgList } = authClient.useListOrganizations()

  if (!orgList) {
    return (
      <div className="w-full flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!orgList.length) {
    return <EmptyOrg />
  }

  return (
    <div className='grid gap-6'>
      <UnderConstruction
        isActive
        title="Overview page is currently under contruction"
        description="You can get an overview of how well your organizations payments and widget integrations are doing"
      />
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Checklist <Badge>1/5</Badge></CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm">
                <LucideArrowUpRightSquare className='size-4' />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-36 rounded-sm'>
              <ItemGroup className='gap-2'>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <Building className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Create Organization</ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <Users2 className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Add team members</ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <Key className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Create api keys</ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <CheckCircleIcon className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Get first transaction</ItemTitle>
                  </ItemContent>
                </Item>
                <Item variant="muted" className='p-1'>
                  <ItemMedia variant="icon">
                    <BanknoteArrowUp className='size-3' />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className='text-xs'>Request first payout</ItemTitle>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Observability</CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm">
                <Link to="/developer/observability">
                  <Expand className='size-4' />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <LineChart data={data}>
              <Grid horizontal />
              <Line dataKey="requests" />
              <XAxis />
              <ChartTooltip />
            </LineChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Analytics</CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm" asChild>
                <Link to="/analytics">
                  <Expand className='size-4' />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className='flex items-start justify-start'>
            <PieChart data={pieData} size={150} innerRadius={30} padAngle={.12} cornerRadius={5}>
              {pieData.map((_, index) => (
                <PieSlice key={index} index={index} />
              ))}
              <PieCenter defaultLabel='Total' prefix='$' />
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
    </div>
  )
}
