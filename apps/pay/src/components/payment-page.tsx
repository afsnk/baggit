'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'

import { ArrowRight, ChevronLeftIcon, Copy, Loader2 } from 'lucide-react'
import { PaymentFlowStepper } from './payment-flow-stepper'
import type { StepProps } from './payment-flow-stepper'
import QRCode from 'react-qr-code'
import { FlipButton } from './ui/flip-button'
import { ReferralCTACard } from './referral-cta'
import { ReceiptSheet } from './ReceiptSheet'
import { ChainPicker } from './NetworkPicker'
import type { Chain } from './NetworkPicker'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Skeleton } from './ui/skeleton'
import { useMutation, useQuery } from '@tanstack/react-query'
import { confirmTransaction, initTransaction } from '#/lib/api-client'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface IPaymentPageProps {
  merchantCallbackUrl: string
  merchantName: string
  amount: number
  pk: string
  paymentId: string
}

// Helper components for the demo content
const CurrencyToggle = ({
  onCurrencyChange,
  currency,
}: {
  onCurrencyChange: (currency: string) => void
  currency: string
}) => (
  <ToggleGroup
    // className="flex items-center text-sm border rounded-md p-1 bg-muted"
    variant="default"
    type="single"
    size="sm"
    defaultValue={currency}
    onValueChange={onCurrencyChange}
  >
    <ToggleGroupItem value="usdt">USDT</ToggleGroupItem>
    <ToggleGroupItem value="usdc">USDC</ToggleGroupItem>
  </ToggleGroup>
)

const PriceDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm">
    <p className="text-muted-foreground">{label}</p>
    <p className="font-medium text-foreground">{value}</p>
  </div>
)

const chains: Chain[] = [
  {
    chainId: crypto.randomUUID(),
    logoUrl: 'https://www.bnbchain.org/favicon.ico',
    description: 'Binance Smart Chain for the Binance Exchange',
    name: 'Binace Smart Chain',
    value: 'bsc',
    explorerUrl: 'https://bscscan.com',
    labels: {
      symbol: 'BSC',
      fees: 'Low Fees',
      // compatible: 'EVM Compatible',
    },
  },
  {
    chainId: crypto.randomUUID(),
    logoUrl: 'https://www.base.org/favicon.ico',
    description: 'Base, ETH Layer 2 chain',
    name: 'Base Blockchain',
    value: 'base',
    explorerUrl: 'https://basescan.org',
    labels: {
      symbol: 'BASE',
      fees: 'Ultra Low Fees',
      // compatible: 'EVM compatible',
    },
  },
]

// TODO: Update props with total count
const CircularTimer = ({ timeLeft }: { timeLeft: number }) => {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = ((90 - timeLeft) / 90) * circumference

  return (
    <div className="relative h-8 w-8">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-border"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <motion.circle
          className="text-green-500"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          style={{ rotate: -90, originX: '50%', originY: '50%' }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-green-500">{timeLeft}</span>
      </div>
    </div>
  )
}

const AddressQRCode = ({
  timer,
  onCancel,
  onComplete,
  address,
}: {
  timer: number | string
  address: string
  onCancel: () => void
  onComplete: () => void
}) => {
  // const address = '0x'.padEnd(32, '0')
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-lg space-y-3">
      <div className="flex flex-row gap-2 w-full">
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-14 lg:w-28 aspect-square border border-border p-1 rounded-sm">
            <QRCode
              size={256}
              style={{
                height: 'auto',
                maxWidth: '100%',
                width: '100%',
                borderRadius: 4,
              }}
              viewBox="0 0 256 256"
              value={address}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-foreground-muted">
            BSC (BEP 20) address
          </span>
          <div className="flex flex-row items-start justify-start max-w-[200px]">
            <span className="flex-1 min-w-0 text-sm text-left text-wrap line-clamp-2 wrap-break-word">
              {address}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="w-6 h-6 shrink-0"
              onClick={() => handleCopy(address)}
            >
              <Copy className="size-3" />
            </Button>
          </div>
          <span className="text-sm font-semibold">Expires in: {timer}</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="underline-offset-1 text-blue-600 text-xs flex gap-1 items-center mt-1"
          >
            Other Options
            <ArrowRight className="size-3" />
          </a>
        </div>
      </div>

      <FlipButton
        frontText="I have made the transfer"
        backText="Confirm payment"
        frontClassName="border border-gray-400"
        className="w-full"
        onClick={() => {
          // window.alert('Complete payment!')
          onComplete()
        }}
      />
      <Button variant="ghost" size="sm" className="w-full" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

export function PaymentPage(props: IPaymentPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [timer, setTimer] = useState(90)

  const [selectedChain, setSelectChain] = useState(chains[0].value)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [currency, setCurrency] = useState('usdt')
  const [confirm, setConfirm] = useState<boolean>(false)
  const amount = props.amount / 1400

  // Mutation/Query
  const {
    mutateAsync,
    isPending,
    data: trxData,
  } = useMutation(initTransaction(props.pk))
  const {
    isLoading,
    data: confirmData,
    error,
  } = useQuery(confirmTransaction(props.pk, confirm, trxData?.id))

  useEffect(() => {
    if (!isLoading && confirmData) {
      setCurrentStep(2)
    }
  }, [isLoading, confirmData, error])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentStep === 1 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      resetFlow() // Auto-reverse to the previous step
    }
    return () => clearInterval(interval)
  }, [currentStep, timer])

  const handleCommit = async () => {
    await mutateAsync({
      network: selectedChain,
      asset: currency,
      paymentId: props.paymentId,
    })
    setCurrentStep(1) // Move to the timer step
  }

  const resetFlow = () => {
    setConfirm(false)
    setCurrentStep(0)
    setTimer(90)
  }

  const steps: StepProps[] = [
    {
      step: 1,
      title: 'Review details',
      description: 'Click continue to generate address for payment',
      content: (
        <div className="space-y-2 mt-1">
          <div className="flex justify-between items-center p-2 border rounded-lg">
            <p className="font-mono font-medium flex items-center gap-1">
              <img
                src={
                  currency === 'usdc' ? `/assets/usdc.png` : `/assets/usdt.svg`
                }
                className="object-cover size-4 rounded-full"
              />
              {amount.toFixed()}
            </p>
            <CurrencyToggle
              onCurrencyChange={setCurrency}
              currency={currency}
            />
          </div>
          <ChainPicker
            chains={chains}
            value={selectedChain}
            onValueChange={(value) => {
              setSelectChain(value)
              // Keep dropdown open after selection
              setPickerOpen(true)
            }}
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            placeholder="Select a chain..."
          />
          <div className="space-y-2 text-sm">
            <PriceDetail
              label="Lifetime platform access"
              value={`${amount.toFixed(2)} ${currency.toUpperCase()}`}
            />
            <PriceDetail
              label="Est. network fee"
              value={`0.096 ${currency.toUpperCase()}`}
            />
          </div>
          <div className="border-t pt-2">
            <PriceDetail
              label="Estimated total"
              value={`${(amount + 0.096).toFixed(2)} ${currency.toUpperCase()}`}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleCommit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {!isPending && 'Continue'}
          </Button>
        </div>
      ),
    },
    {
      step: 2,
      title: 'Make transfer',
      description: `Send exactly ${amount.toFixed()} to generated address on chain`,
      content: (
        <AddressQRCode
          timer={timer}
          onCancel={resetFlow}
          onComplete={() => {
            setConfirm(true)
          }}
          address={trxData?.address || ''}
        />
      ),
    },
    {
      step: 3,
      title: 'Complete transaction',
      description: 'Confirming your transaction',
      content: (
        <div className="flex flex-col space-y-2">
          {isLoading && (
            <>
              <h4 className="font-semibold text-xs text-center">
                Making sure the stars align
              </h4>
              <Skeleton className="h-28" />
            </>
          )}
          {!isLoading && confirmData && (
            <>
              <ReferralCTACard
                title="Earnings on Subscriptions"
                amount={128.32}
                currency="$"
                subCardTitle="Share with friends"
                subCardSubtitle="Earn when they complete subscription"
                moreCount={8}
                onSubCardClick={() => {
                  window.alert(`Referral Earnings are comming soon`)
                }}
                avatars={[
                  { src: 'https://i.pravatar.cc/150?img=1', alt: 'User 1' },
                  { src: 'https://i.pravatar.cc/150?img=2', alt: 'User 2' },
                  { src: 'https://i.pravatar.cc/150?img=3', alt: 'User 3' },
                ]}
              />
              <ReceiptSheet confirmData={confirmData}>
                <Button className="w-full">View Receipt</Button>
              </ReceiptSheet>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <main className="w-full min-w-screen overflow-hidden lg:h-screen lg:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;The payment partner for modern founders, AI agents and Web
              3 Apps.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold">
              ~ Popular opinion ❤️
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      <div className="relative w-full h-screen grid items-start lg:items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
        </div>

        <div className="space-y-2 w-full p-3 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-start gap-2">
            <Avatar className="size-10 p-2 rounded-md object-contain border border-green-500">
              <AvatarImage
                src={`${new URL(props.merchantCallbackUrl).href}/favicon.ico`}
              />
              <AvatarFallback>
                {props.merchantName.at(0)?.toUpperCase()}
                {props.merchantName.at(1)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <h1 className="font-heading text-lg font-bold tracking-wide m-0">
                {props.merchantName} subscription
              </h1>
              <p className="text-muted-foreground text-sm">
                Unlock access to {props.merchantName}
              </p>
            </div>
          </div>

          <PaymentFlowStepper
            currentStep={currentStep}
            steps={steps}
            // headerTitle="Payment widget"
            headerComponent={
              <div>
                <Button variant="ghost" asChild>
                  <a href={props.merchantCallbackUrl}>
                    <ChevronLeftIcon className="size-4 me-2" />
                    Back to {props.merchantName || 'Merchant name'}
                  </a>
                </Button>
              </div>
            }
            timerComponent={<CircularTimer timeLeft={timer} />}
            // headerStatus="Review"
          />
        </div>
      </div>
    </main>
  )
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  )
}

// const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     {...props}
//   >
//     <g>
//       <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
//     </g>
//   </svg>
// )

// const AuthSeparator = () => {
//   return (
//     <div className="flex w-full items-center justify-center">
//       <div className="bg-border h-px w-full" />
//       <span className="text-muted-foreground px-2 text-xs">OR</span>
//       <div className="bg-border h-px w-full" />
//     </div>
//   )
// }
