import { Badge } from './ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'

interface CryptoSaleProps {
  token: string
  symbol: string
  icon: string
  action: 'buy' | 'sell'
}
export default function CryptoSale({
  token,
  symbol,
  icon,
  action,
}: CryptoSaleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-3">
      <div className="border border-cyan-300 flex flex-col items-start space-y-5">
        <Badge className="space-x-3">
          <img
            className="size-5"
            src={icon}
            alt="token-icon"
            data-icon="inline-start"
          />
          {token}
          {symbol}
        </Badge>
        <h1 className="md:text-3xl text-balance line-clamp-2 font-bold font-sans">
          {action === 'buy' ? 'Buying' : 'Selling'} {token} made simple
        </h1>
        <p className="text-sm font-medium">
          Baggit.link offers a fast and easy way to {action} {token} ({symbol})
          with a credit or debit card, bank transfer, Apple Pay, Google Pay, and
          more.
        </p>
        <div className="w-full">
          <h3 className="font-medium text-sm">
            How to {action} {token} in 3 simple steps
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="relative pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src="https://avatar.vercel.sh/shadcn1"
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
              />
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>
                  Enter how much {token} you want to {action}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src="https://avatar.vercel.sh/shadcn1"
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
              />
              <CardHeader>
                <CardTitle>Pay</CardTitle>
                <CardDescription>
                  Pay using one of 40+ payment methods.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src="https://avatar.vercel.sh/shadcn1"
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
              />
              <CardHeader>
                <CardTitle>Receive</CardTitle>
                <CardDescription>
                  Receive the Bitcoin in your wallet.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
      <div className="border border-red-400 sticky top-24 self-start">
        <div className="">Embbed</div>
      </div>
    </div>
  )
}
