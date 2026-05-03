/**
 * URL to load client side widget to buy/sell crypto easily
 */

import { Button } from '#/components/ui/button'
import {
  createFileRoute,
  createRoute,
  Outlet,
  useNavigate,
  Link,
  useLoaderData,
} from '@tanstack/react-router'

export const Route = createFileRoute('/micro/ramp')({
  component: RouteComponent,
  ssr: false,
})

function RouteComponent() {
  return (
    <div>
      <Button asChild>
        <Link to="/micro/ramp/picker" viewTransition>
          Start payment
        </Link>
      </Button>

      <Outlet />
    </div>
  )
}

function TokenPicker() {
  const navigate = useNavigate()
  const pickPaymentMethod = () => {
    navigate({ to: '/micro/ramp/pay-method' })
  }

  return (
    <div>
      <h1>Token picker</h1>
      <input type="number" placeholder="Enter amount" />
      <Button onClick={pickPaymentMethod}>Continue</Button>
    </div>
  )
}

function PaymentMethod() {
  const { name, age } = useLoaderData({ from: '/micro/ramp/pay-method' as any })

  return (
    <div>
      <h1>Pick payment method</h1>
      <span>Age: {age}</span>
      <Button
        onClick={() => {
          window.alert('Payment completed')
        }}
      >
        Complete payment
      </Button>
    </div>
  )
}

const paymentMethodRouter = createRoute({
  path: '/pay-method',
  component: PaymentMethod,
  getParentRoute: () => Route,
  ssr: false,
  loader: async () => {
    await new Promise((r, _) => setTimeout(r, 2000))
    return {
      name: 'Miracle',
      age: 18,
    }
  },
})

const pickerRouter = createRoute({
  path: '/picker',
  component: TokenPicker,
  getParentRoute: () => Route,
  ssr: false,
})

Route.addChildren([paymentMethodRouter, pickerRouter])
