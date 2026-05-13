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
import { useState } from 'react'
import { KYCModal } from './-components/kyc.modal'

export const Route = createFileRoute('/_main/buy')({
  component: RouteComponent,
})

function RouteComponent() {
  const [payType, setPayType] = useState('Bank Transfer')
  return (
    <div className="w-full grid gap-4">
      <ExchangeCard defaultMode="buy" />
      {/*<div className="grid grid-cols-4 gap-2 items-center justify-around">
        {['10K', '50K', '100K', '250K'].map((item) => (
          <Badge asChild key={item} className="max-w-md w-full h-8">
            <Button variant="default">{item}</Button>
          </Badge>
        ))}
      </div>*/}
      {/*<div className="grid w-full gap-3 my-4">
        <Label>Pay with</Label>
        <Select defaultValue={payType} onValueChange={setPayType}>
          <SelectTrigger className="w-full border border-gray-700">
            <SelectValue placeholder="Pick payment method" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {['Bank Transfer', 'Card', 'Direct Debit'].map((item) => (
              <SelectItem
                value={item}
                key={item}
                disabled={item !== 'Bank Transfer'}
              >
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>*/}
      <KYCModal>
        <Button variant="default" size="lg" className="w-full my-6">
          Buy USDT Via {payType}
        </Button>
      </KYCModal>
    </div>
  )
}
