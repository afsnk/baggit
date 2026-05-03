import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'

export default function ExchangeCard({
  defaultMode = 'buy',
}: {
  defaultMode: 'buy' | 'sell'
}) {
  return (
    <div className="grid grid-cols-2 gap-1 relative items-center justify-center w-full">
      <FiatCard order={defaultMode} />
      <SwitchButton order={defaultMode} />
      <TokenCard order={defaultMode} />
    </div>
  )
}

function SwitchButton({ order }: { order: 'sell' | 'buy' }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8">
      <Button size="icon-sm" asChild>
        <Link to={order === 'buy' ? '/sell' : '/buy'}>
          <IconTransfer />
        </Link>
      </Button>
    </div>
  )
}

const defaultInputStyle = `text-2xl border-none outline-0 focus-visible:border-none focus-visible:ring-0 px-1 bg-transparent`
function FiatCard({ order }: { order: 'sell' | 'buy' }) {
  return (
    <Card
      className={cn('bg-muted border border-gray-700', {
        'order-2': order === 'sell',
        'order-1': order === 'buy',
      })}
    >
      <CardHeader>
        <CardDescription>You send</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="number"
          defaultValue={0.0}
          className={cn(
            defaultInputStyle,
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          )}
        />
      </CardContent>
      <CardFooter>
        <Select defaultValue="SOL">
          <SelectTrigger className="w-full border border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['SOL', 'BTC', 'USDC', 'USDT'].map((item) => (
              <SelectItem value={item} key={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  )
}

function TokenCard({ order }: { order: 'sell' | 'buy' }) {
  return (
    <Card
      className={cn({
        'order-1': order === 'sell',
        'order-2': order === 'buy',
      })}
    >
      <CardHeader>
        <CardDescription>You get</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="number"
          defaultValue={0.0}
          className={cn(
            defaultInputStyle,
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          )}
        />
      </CardContent>
      <CardFooter>
        <Select defaultValue="NGN">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['NGN', 'KSH', 'GSH', 'GPT'].map((item) => (
              <SelectItem value={item} key={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  )
}

const IconTransfer = ({ className }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(
      'icon icon-tabler icons-tabler-outline icon-tabler-transfer',
      className,
    )}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M20 10h-16l5.5 -6" />
    <path d="M4 14h16l-5.5 6" />
  </svg>
)
