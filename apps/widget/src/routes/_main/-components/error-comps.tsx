import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { CircleAlertIcon } from 'lucide-react'

interface ErrorAlertProps {
  errorTitle: string
  errorDescription: string
  checkList: Array<string>
}
export function ErrorAlert(props: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{props.errorTitle ?? 'Payment Failed'}</AlertTitle>
      <AlertDescription>
        <p>{props.errorDescription ?? 'Please check your payment details:'}</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm">
          {props.checkList.map((message) => (
            <li>{message ?? 'Card number and expiry'}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
