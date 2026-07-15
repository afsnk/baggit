import {BanknoteArrowUp, Copy } from "lucide-react"
import QRCode from 'react-qr-code'
import { Badge } from '#/components/ui/badge'
import { Button } from "#/components/ui/button";


const PaymentDetails = ({
  onCancel,
  // onComplete,
  details,
  chain,
}: {
    chain: string;
  details: {
    address: string
  } | {
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | undefined
  onCancel: () => void
  // onComplete: () => void
}) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-lg space-y-3">
      <div className="flex flex-row gap-2 w-full">
        <div className="flex flex-col items-center justify-center">
          {typeof details !== "undefined" && 'address' in details && (
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
                value={details.address}
              />
            </div>
          )}

          {typeof details !== "undefined" && ('bankName' in details || 'accountNumber' in details || 'accountName' in details)  && (
            <div className="flex w-8 lg:w-14 aspect-square items-center justify-center border border-border p-1 rounded-sm">
              <BanknoteArrowUp className='size-4' />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          {typeof details !== "undefined" && 'address' in details && (
            <>
              <span className="text-xs text-foreground-muted">
                {chain.toUpperCase()} {chain === "bsc"? '(BEP-20)' : '(ERC-20)'} address
              </span>
              <div className="flex flex-row items-start justify-start max-w-50">
                <span className="flex-1 min-w-0 text-sm font-semibold text-left text-wrap line-clamp-2 wrap-break-word">
                  {details.address}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-6 h-6 shrink-0"
                  onClick={() => handleCopy(details.address)}
                >
                  <Copy className="size-3" />
                </Button>
              </div>
            </>
          )}
          {typeof details !== "undefined" && ('bankName' in details) && (
            <div className='grid space-y-2'>
              <Badge variant="secondary" className="text-xs text-foreground-muted">{details.bankName}</Badge>
              <div className="flex flex-row items-start justify-start max-w-50">
                <span className="flex-1 min-w-0 text-sm font-semibold text-left text-wrap line-clamp-2 wrap-break-word">
                  {details.accountNumber}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-6 h-6 shrink-0"
                  onClick={() => handleCopy(details.accountNumber)}
                >
                  <Copy className="size-3" />
                </Button>
              </div>
              <span className="flex-1 min-w-0 text-sm text-left text-wrap line-clamp-2 wrap-break-word">
                {details.accountName}
              </span>
            </div>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="w-full" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

export default PaymentDetails;
