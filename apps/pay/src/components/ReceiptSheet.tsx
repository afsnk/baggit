import type { Transaction } from '@baggit/api/app'
import { AnimatedTicket } from './receipt-confirmation-card'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

interface ReceiptSheetProps {
  children: React.ReactNode
  confirmData: Transaction | null
}
export const ReceiptSheet = (props: ReceiptSheetProps) => {
  console.log(`Transaction data`, { data: props.confirmData })
  return (
    <Sheet>
      <SheetTrigger>{props.children}</SheetTrigger>
      <SheetContent side="bottom" showCloseButton={true} className="h-screen">
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
          <AnimatedTicket
            ticketId="0120034399434"
            amount={305.5}
            date={new Date('2025-06-19T10:15:00')}
            cardHolder="Liana80 Tudakova"
            last4Digits="8237"
            barcodeValue="28937261273650"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
