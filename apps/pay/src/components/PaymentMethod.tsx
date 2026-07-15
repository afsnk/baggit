import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChainPicker } from '@/components/NetworkPicker'
import { Loader2 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {updatePayment} from "#/lib/api-client"
import { useMutation } from "@tanstack/react-query"
import type { Chain } from '@/components/NetworkPicker'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { useState } from "react"
import { Button } from "@/components/ui/button"


const paymentMethods = [
  {value: "bank-transfer", label: "Bank Transfer", enabled: true},
  {value: "crypto", label: "Crypto", enabled: true},
  {value: "ussd", label: "USSD", enabled: false},
  {value: "applepay", label: "Apple pay", enabled: false},
  {value: "googlepay", label: "Google pay", enabled: false}
]

// Helper components for the demo content
const CurrencyToggle = ({
  onCurrencyChange,
  currency,
  method,
}: {
  onCurrencyChange: (currency: string) => void
  currency: string
  method: string
  }) => (
    <ToggleGroup
      // className="flex items-center text-sm border rounded-md p-1 bg-muted"
      variant="default"
      type="single"
      size="sm"
      defaultValue={currency}
      value={currency}
      onValueChange={async (value: string) => {
        if (!value) {
          onCurrencyChange(currency)
        } else {
          onCurrencyChange(value)
        }
      }}
    >
      {
        method === "bank-transfer" && (
          <>
            <ToggleGroupItem value="ngn">NGN</ToggleGroupItem>
            <ToggleGroupItem value="ngn" disabled>USD</ToggleGroupItem>
          </>
        )
      }
      {
        method === "crypto" && (
          <>
            <ToggleGroupItem value="usdt">USDT</ToggleGroupItem>
            <ToggleGroupItem value="usdc">USDC</ToggleGroupItem>
          </>
        )
      }

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
    chainId: `bsc`,
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
    chainId: `base`,
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

interface IProps {
  handleCommit: () => Promise<void>;
  paymentId: string;
  isInitTransactionLoading: boolean
  paymentMethod: string;
  setPaymentMethod: (method: string) => void
  currency: string;
  setCurrency: (currency: string) => void
  amount: number;
  exchangeRate: number | null;
  selectedChain: string;
  setSelectChain: (chain: string) => void
}
const PaymentMethodPicker = ({
  handleCommit,
  paymentId,
  isInitTransactionLoading,
  paymentMethod,
  setPaymentMethod,
  currency,
  setCurrency,
  amount,
  exchangeRate,
  selectedChain,
  setSelectChain,
}: IProps) => {
  const payment = useMutation(updatePayment(paymentId))
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="space-y-2 mt-1">
      <div className='w-full'>
        <Select
          defaultValue={paymentMethod}
          onValueChange={(value) => {
          const computedAmount = Number(value === "crypto" ? (amount / (exchangeRate || 1400)).toFixed(2) : amount)
          console.log(`Method value`, {value, computedAmount})
          payment.mutate({
            method: value,
            amount: computedAmount,
            currency: value === "crypto"? "usdt" : "ngn"
          })

          if (value === "crypto") {
            setCurrency("usdt")
          } else {
            setCurrency("ngn")
          }
          setPaymentMethod(value)
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pick payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {paymentMethods.map(({value, label, enabled}) => (
                <SelectItem key={value} value={value} className='capitalize' isLoading={payment.isPending} disabled={!enabled}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between items-center p-1 border rounded-lg">
        {payment.isPending
          ? <Loader2 className='size-4 animate-spin' />
          : (<p className="font-mono font-medium flex items-center gap-1">
                <Avatar className="size-4 rounded-md object-contain">
                  <AvatarImage
                    src={
                      currency === 'usdc'
                        ? `/assets/usdc.png`
                        : currency === 'usdt'
                          ? `/assets/usdt.svg`
                          : undefined
                    }
                  />
                  <AvatarFallback>{'₦'}</AvatarFallback>
                </Avatar>
              {(paymentMethod === "crypto"? (amount/(exchangeRate || 1400)) : amount).toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2})}
            </p>)}
        <CurrencyToggle
          onCurrencyChange={(newCurrency: string) => {
            console.log(`Currency toggle`, {newCurrency})
            payment.mutate({
              method: paymentMethod,
              amount: Number(paymentMethod === "crypto" ? (amount / (exchangeRate || 1400)).toFixed(2) : amount),
              currency: newCurrency
            })
            setCurrency(newCurrency)
          }}
          currency={currency}
          method={paymentMethod}
          // isLoadingMethod={payment.isPending}
        />
      </div>
      {!(currency === 'ngn') && (
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
      )}
      <div className="space-y-2 text-sm">
        <PriceDetail
          label="Total due"
          value={`${amount.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })} ${currency.toUpperCase()}`}
        />
      </div>
      <Button
        className="w-full"
        onClick={handleCommit}
        disabled={!currency || isInitTransactionLoading}
      >
        {isInitTransactionLoading && <Loader2 className="animate-spin" />}
        {!isInitTransactionLoading && 'Continue'}
      </Button>
    </div>
  )
}


export default PaymentMethodPicker;
