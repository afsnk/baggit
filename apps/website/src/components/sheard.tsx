import { cn } from '#/lib/utils'
import type React from 'react'

export type LinkItemType = {
  label: string
  href?: string
  icon: React.ReactNode
  iconClassName?: string
  description?: string
}

export type MainNavItemType = {
  label: string
  href?: string
  icon?: React.ReactNode
  iconClassName?: string
  description?: string
  subItems?: MainNavItemType[]
}

export function LinkItem({
  label,
  description,
  icon,
  className,
  href,
  iconClassName,
  ...props
}: React.ComponentProps<'div'> & (LinkItemType | MainNavItemType)) {
  return (
    <div
      className={cn('flex flex-row items-center gap-x-2', className)}
      {...props}
    >
      <div
        className={cn(
          'flex aspect-square size-12 items-center justify-center rounded-md border bg-card text-sm shadow-sm',
          "[&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='size-'])]:text-foreground",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="font-medium">{label}</span>
        <span className="line-clamp-2 text-balance text-muted-foreground text-xs">
          {description}
        </span>
      </div>
    </div>
  )
}
