import { createFileRoute } from '@tanstack/react-router'
import ExchangeCard from './-components/exchange-card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute('/_main/sell')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full grid gap-4">
      <ExchangeCard defaultMode="sell" />
      <div className="grid grid-cols-4 gap-2 items-center justify-around">
        {['10K', '50K', '100K', '250K'].map((item) => (
          <Badge asChild key={item} className="max-w-md w-full h-8">
            <Button variant="default">{item}</Button>
          </Badge>
        ))}
      </div>
      <div className="grid w-full gap-3">
        <Label>Pay with</Label>
        <Select defaultValue={`Address`}>
          <SelectTrigger className="w-full border border-gray-700">
            <SelectValue placeholder="Pick payment method" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {['Address', 'Binance', 'Wallet connect'].map((item) => (
              <SelectItem value={item} key={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="default" size="lg" className="w-full mt-12">
        Sell USDT Via Wallet address
      </Button>
    </div>
  )
}
