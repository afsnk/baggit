import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { getBalanceOptions } from "#/lib/api-client";
import { useIsMobile } from "#/hooks/use-mobile";
import { PiggyBank } from "lucide-react";

interface IBalanceProps { }
export default function Balance(_props: IBalanceProps) {
  const { data, error, isLoading } = useQuery(getBalanceOptions)
  const isMobile = useIsMobile()
  return (
    <div className='p-1 bg-muted flex items-center justify-center gap-4 rounded-lg'>
      <div className='grid items-start'>
        <span className='text-xs font-light text-muted-foreground'>Balance</span>
        <span className='text-sm font-semibold text-primary'>₦ {data?.totalNgnBalance.toLocaleString('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}</span>
      </div>
      <Button
        size={isMobile ? "icon-sm" : "sm"}
        variant="default"
        disabled={isLoading || !!error}>{isMobile ? <PiggyBank /> : "Request payout"}</Button>
    </div>
  )
}
