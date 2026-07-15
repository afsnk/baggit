import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { getBalanceOptions } from "#/lib/api-client";

interface IBalanceProps { }
export default function Balance(props: IBalanceProps) {
  const { data, error, isLoading } = useQuery(getBalanceOptions)
  return (
    <div className='p-1 bg-muted flex items-center justify-center gap-4 rounded-lg'>
      <div className='grid items-start'>
        <span className='text-xs font-light text-muted-foreground'>Balance</span>
        <span className='text-sm font-semibold text-primary'>{data?.totalBalance}</span>
      </div>
      <Button size="sm" variant="default" disabled={isLoading || !!error}>Request payout</Button>
    </div>
  )
}
