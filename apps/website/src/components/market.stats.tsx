import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'

export default function MarketStats({
  symbol,
  title,
  description,
  children,
}: {
  symbol: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <Card className="w-full bg-accent-foreground/20">
      <CardHeader>
        <CardTitle className="w-full flex items-center justify-start gap-3 mb-4">
          <div className="size-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-slate-900 font-bold">
            {symbol.slice(-1)}
          </div>
          <span className="text-md md:text-lg font-medium">{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    direction: 'up' | 'down'
    value: string | number
  }
  className?: string
  variant?: 'default' | 'highlight'
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
  variant = 'default',
}: StatCardProps) {
  return (
    <div className="flex items-start justify-between bg-accent rounded-xl p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
        <p className="text-lg md:text-2xl font-bold text-white break-words">
          {value}
        </p>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            <span
              className={cn(
                'text-sm font-semibold',
                trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </span>
          </div>
        )}
      </div>
      {icon && (
        <div className="ml-4 flex-shrink-0 p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
          {icon}
        </div>
      )}
    </div>
  )
}

interface StatsDisplayProps {
  children: ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4
}

export function StatsDisplay({
  children,
  className,
  columns = 2,
}: StatsDisplayProps) {
  const gridColsClass = {
    1: 'md:grid-cols-1 sm:grid-cols-1',
    2: 'md:grid-cols-2 sm:grid-cols-2',
    3: 'md:grid-cols-3 sm:grid-cols-3',
    4: 'md:grid-cols-4 sm:grid-cols-4',
  }[columns]

  return (
    <div
      className={cn(
        'grid grid-cols-1',
        gridColsClass,
        'gap-2 md:gap-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
