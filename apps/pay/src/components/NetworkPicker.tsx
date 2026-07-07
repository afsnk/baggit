'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
// import { Orb } from '@/components/ui/orb'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface Chain {
  chainId: string
  name: string
  value: string
  logoUrl?: string
  labels: {
    symbol?: string
    fees?: string
    compatible?: string
  }
  description?: string
  explorerUrl: string
}

interface ChainPickerProps {
  chains: Chain[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function ChainPicker({
  chains,
  value,
  onValueChange,
  placeholder = 'Select a voice...',
  className,
  open,
  onOpenChange,
}: ChainPickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const selectedChain = chains.find((c) => c.value === value)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn('w-full justify-between', className)}
        >
          {selectedChain ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="relative size-6 shrink-0 overflow-visible">
                <img
                  src={selectedChain.logoUrl}
                  alt={selectedChain.name}
                  className="size-6 shrink-0 items-center justify-center object-cover rounded-full"
                />
              </div>
              <span className="truncate">{selectedChain.name}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search chains..." />
          <CommandList>
            <CommandEmpty>No chain found.</CommandEmpty>
            <CommandGroup>
              {chains.map((chain) => (
                <ChainPickerItem
                  key={chain.chainId}
                  chain={chain}
                  isSelected={value === chain.value}
                  onSelect={() => {
                    onValueChange?.(chain.value)
                    setIsOpen?.(false)
                  }}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface ChainPickerItemProps {
  chain: Chain
  isSelected: boolean
  onSelect: () => void
}

function ChainPickerItem({
  chain,
  isSelected,
  onSelect,
}: ChainPickerItemProps) {
  const [_isHovered, setIsHovered] = React.useState(false)

  const preview = chain.explorerUrl
  const audioItem = React.useMemo(
    () => (preview ? { id: chain.chainId, src: preview, data: chain } : null),
    [preview, chain],
  )

  const handlePreview = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!audioItem) return
    },
    [audioItem],
  )

  return (
    <CommandItem
      value={chain.name}
      onSelect={onSelect}
      className="flex items-center gap-3"
    >
      <div
        className="relative z-10 size-8 shrink-0 cursor-pointer overflow-visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePreview}
      >
        <img
          src={chain.logoUrl}
          alt={chain.name}
          className="pointer-events-none absolute inset-0 size-6 shrink-0 items-center justify-center object-cover rounded-full"
        />
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-medium">{chain.name}</span>
        {
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {chain.labels.symbol && <span>{chain.labels.symbol}</span>}
            {chain.labels.fees && <span>•</span>}
            {chain.labels.fees && (
              <span className="capitalize">{chain.labels.fees}</span>
            )}
            {chain.labels.compatible && <span>•</span>}
            {chain.labels.compatible && (
              <span className="capitalize">{chain.labels.compatible}</span>
            )}
          </div>
        }
      </div>

      <Check
        className={cn(
          'ml-auto size-4 shrink-0',
          isSelected ? 'opacity-100' : 'opacity-0',
        )}
      />
    </CommandItem>
  )
}

export { ChainPicker, ChainPickerItem }
