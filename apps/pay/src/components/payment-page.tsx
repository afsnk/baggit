'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'

import { ChevronLeftIcon } from 'lucide-react'
import { PaymentFlowStepper } from './payment-flow-stepper'
import type { StepProps } from './payment-flow-stepper'

import { ReferralCTACard } from './referral-cta'

import { Skeleton } from './ui/skeleton'
import { useMutation } from '@tanstack/react-query'
import { initTransaction } from '#/lib/api-client'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

import { useNatsKVWatcher } from './nats/use-kv-watcher'
import PaymentDetails from './PaymentDetails'
import PaymentMethodPicker from './PaymentMethod'

interface IPaymentPageProps {
  merchantCallbackUrl: string
  merchantName: string
  amount: number
  paymentId: string
  orgId: string
  reference: string
  method: string | 'bank-transfer' | 'crypto'
  exchangeRate: number | null
  currency: string | null
}

// TODO: Update props with total count
const CircularTimer = ({
  timeLeft,
  timerCount,
}: {
  timeLeft: number
  timerCount: number
}) => {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = ((timerCount - timeLeft) / timerCount) * circumference

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

const TIMER_COUNT = 30
export function PaymentPage(props: IPaymentPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [timer, setTimer] = useState(TIMER_COUNT)

  const [selectedChain, setSelectChain] = useState('bsc')
  const [currency, setCurrency] = useState(props.currency || 'ngn')
  const [paymentMethod, setPaymentMethod] = useState<string>(props.method)
  const [step3Text, setStep3Text] = useState<string>('Transaction in-progress')

  // Mutation/Query
  const {
    mutateAsync,
    isPending: isInitTransactionLoading,
    data: trxData,
  } = useMutation(initTransaction())

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentStep === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      redirectToMerchant() // Auto-redirect to merchant
    }
    return () => clearInterval(interval)
  }, [currentStep, timer])

  const handleCommit = async () => {
    await mutateAsync({
      network: paymentMethod === "crypto"? "bsc" : selectedChain,
      asset: currency,
      paymentId: props.paymentId,
      orgId: props.orgId,
    })
    setCurrentStep(1) // Move to the timer step
  }

  const resetFlow = () => {
    setCurrentStep(0)
  }

  const retryPayment = () => {
    setCurrentStep(1)
    setTimer(30)
  }

  const redirectToMerchant = () => {
    const url = new URL(props.merchantCallbackUrl)
    url.searchParams.append('status', 'success')
    url.searchParams.append('reference', props.reference)
    url.searchParams.append('paymentId', props.paymentId)

    window.location.href = url.toString()
  }

  const {
    status,
    value: transactionValue,
    key,
  } = useNatsKVWatcher(`transaction.tracker.${props.paymentId}`)
  console.log(`Watched values`, { status, transactionValue, key })

  useEffect(() => {
    if (transactionValue === 'complete') {
      setStep3Text(`Transaction successful`)
    }

    if (transactionValue === 'processing') {
      setStep3Text(`Transaction in progress`)
      setCurrentStep(2)
		}

		if (!!transactionValue && transactionValue.includes('failed')) {
			setStep3Text(`Transaction failed, kindly refresh and try again`)
    }
  }, [transactionValue])

  const steps: StepProps[] = [
    {
      step: 1,
      title: 'Pick a payment method',
      description: 'Click continue to generate payment details',
      content: (
        <PaymentMethodPicker
          handleCommit={handleCommit}
          paymentId={props.paymentId}
          isInitTransactionLoading={isInitTransactionLoading}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          currency={currency}
          setCurrency={setCurrency}
          amount={props.amount}
          exchangeRate={props.exchangeRate}
          selectedChain={selectedChain}
          setSelectChain={setSelectChain}
        />
      ),
    },
    {
      step: 2,
      title: 'Make transfer',
      description: (
        <span>
          Send exactly{' '}
          <b className="text-green-500">
            {currency.toUpperCase()}
            {(trxData?.amount || paymentMethod === 'bank-transfer'
              ? trxData?.amount || props.amount
              : props.amount / (props.exchangeRate || 1400)
            ).toFixed()}
          </b>{' '}
          to the{' '}
          {paymentMethod === 'crypto' ? 'address on chain' : 'account details'}
        </span>
      ),
      content: (
        <PaymentDetails
          onCancel={resetFlow}
          chain={selectedChain}
          details={trxData?.details}
        />
      ),
    },
    {
      step: 3,
      title: step3Text,
      description:
        transactionValue === 'processing'
          ? 'Confirming your transaction'
          : transactionValue === 'complete'
            ? `You will be redirected back to the merchant in ${timer} seconds`
            : 'Waiting for your transfer to be received and processed',
      content: (
        <div className="flex flex-col space-y-2">
          {transactionValue === 'processing' && (
            <>
              <h4 className="font-semibold text-xs text-center">
                Making sure the stars align
              </h4>
              <Skeleton className="h-28" />
            </>
          )}
          {transactionValue === 'complete' && (
            <>
              <ReferralCTACard
                title="Earnings on Subscriptions"
                amount={128.32}
                currency="$"
                subCardTitle="Share with friends"
                subCardSubtitle="Earn when they complete payment"
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
              {transactionValue.includes('failed') && (
                <Button className="w-full" onClick={retryPayment}>
                  View Receipt
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <main className="w-full min-w-screen overflow-hidden lg:h-screen lg:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-linear-to-t to-transparent" />
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
      <div className="relative w-full h-screen grid items-center justify-center">
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
            timerComponent={
              <CircularTimer timeLeft={timer} timerCount={TIMER_COUNT} />
            }
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
