import { Button } from '#/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '#/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  banks,
  checkBank,
  getBalanceOptions,
  initPayoutOptions,
} from '#/lib/api-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCheck, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface IPayout {
  children: React.ReactNode
}
export default function PayoutModal(props: IPayout) {
  const createPayout = useMutation(initPayoutOptions)
  const lookupBank = useMutation(checkBank)
  const getBanks = useQuery(banks)
  const balance = useQuery(getBalanceOptions)
  const [bankCode, setBankCode] = useState<string | null>(null)
  const [withdrawType, setWithdrawType] = useState<'full' | 'partial'>('full')
  const [customAmount, setCustomAmount] = useState<number>(
    balance.data?.totalNgnBalance || 0,
  )
  const [accountNumber, setAccountNumber] = useState<string | null>(null)

  return (
    <Popover>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>Request payout</PopoverTitle>
          <PopoverDescription>Payout to your bank account.</PopoverDescription>
        </PopoverHeader>
        <FieldGroup className="gap-4 mt-4">
          <Field>
            <FieldLabel htmlFor="banks" className="w-1/2">
              Banks
            </FieldLabel>
            <Select
              onValueChange={(value) => {
                setBankCode(value)
                if (accountNumber && accountNumber.length === 10) {
                  lookupBank.mutate({
                    accountNumber: accountNumber,
                    bankCode: value,
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    getBanks.isLoading ? 'Loading banks...' : 'Select bank'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(getBanks.data ?? []).map((item, index) => (
                  <SelectItem key={`${item.code}-${index}`} value={item.code}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field orientation="vertical">
            <FieldLabel htmlFor="account_number" className="w-1/2">
              Account number
            </FieldLabel>
            <Input
              id="account_number"
              placeholder="Enter account number"
              onChange={(e) => {
                setAccountNumber(e.target.value)
                if (
                  e.target.value &&
                  e.target.value.length === 10 &&
                  bankCode
                ) {
                  lookupBank.mutate({
                    accountNumber: e.target.value,
                    bankCode: bankCode,
                  })
                }
              }}
            />
          </Field>
          <Field orientation="vertical">
            <FieldLabel htmlFor="account_name" className="w-1/2">
              Account name
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="account_name"
                placeholder="John Doe"
                value={lookupBank.data?.accountName}
                contentEditable={false}
                disabled
              />
              <InputGroupAddon align="inline-end">
                {lookupBank.isPending && (
                  <>
                    <InputGroupText>Getting account...</InputGroupText>
                    <Loader2 className="animate-spin" />
                  </>
                )}
                {!lookupBank.isPending && lookupBank.data && (
                  <CheckCheck className="text-green-400" />
                )}
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <InputGroup>
              <InputGroupInput
                id="withdraw_type"
                type="number"
                placeholder="Amount to withdraw"
                disabled={withdrawType === 'full'}
                contentEditable={withdrawType !== 'full'}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.valueAsNumber)
                }}
              />
              <InputGroupAddon align="inline-start">
                <Select
                  defaultValue="full"
                  onValueChange={(value: 'full' | 'partial') =>
                    setWithdrawType(value)
                  }
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
        <Button
          size="sm"
          className="w-full mt-4"
          disabled={createPayout.isPending || !accountNumber || accountNumber.length !== 10 || !bankCode || !lookupBank.data}
          onClick={() =>
            createPayout.mutate({
              accountNumber: lookupBank.data?.accountNumber || '',
              accountName: lookupBank.data?.accountName || '',
              bankCode: lookupBank.data?.bankCode || '',
              reference: crypto.randomUUID(),
              amount: customAmount,
            })
          }
        >
          Withdraw
        </Button>
      </PopoverContent>
    </Popover>
  )
}
