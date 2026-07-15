'use client'

import type {
  ColumnDef,
} from '@tanstack/react-table'
import { LinkIcon } from 'lucide-react'
import { cn } from '#/lib/utils.ts'
import { Badge } from '#/components/ui/badge.tsx'
import { Checkbox } from '#/components/ui/checkbox.tsx'
import type { Transaction } from "@baggit/api/app"
import { DataTable } from './data-table'

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case "complete":
      return 'bg-emerald-500'
    case "canceled":
    case "failed":
      return 'bg-red-500'
    default:
      return 'bg-muted-foreground/64'
  }
}

const columns: ColumnDef<Transaction>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        className="mx-2.5"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    header: ({ table }) => {
      const isAllSelected = table.getIsAllPageRowsSelected()
      const isSomeSelected = table.getIsSomePageRowsSelected()
      return (
        <Checkbox
          aria-label="Select all rows"
          className="mx-2.5"
          checked={isAllSelected}
          indeterminate={isSomeSelected && !isAllSelected}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      )
    },
    id: 'select',
    size: 28,
  },
  {
    accessorKey: 'id',
    cell: ({ row }) => (
      <div className="font-medium font-mono text-muted-foreground">
        {(row.getValue('id') as string).slice(0, 12)}
      </div>
    ),
    header: 'Transaction ID',
    size: 120,
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const status: Transaction['status'] = row.getValue('status')
      return (
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className={cn('size-1.5 rounded-full', getStatusColor(status))}
          />
          {status}
        </Badge>
      )
    },
    header: 'Status',
    size: 60,
  },
  {
    accessorKey: 'network',
    cell: ({ row }) => {
      const network: string = row.getValue('network')
      return (
        <Badge className="font-normal tabular-nums" size="lg" variant="outline">
          <LinkIcon />
          <span>{network.toUpperCase()}</span>
        </Badge>
      )
    },
    header: 'Network',
    size: 80,
  },
  {
    accessorFn: (prop) => prop.payment.currency,
    header: 'Asset',
    size: 50,
  },
  {
    accessorFn: (prop) => prop.payment.amount,
    header: 'Amount',
    size: 80
  },
  {
    accessorKey: 'createdAt',
    header: 'Date created',
    cell: ({ row }) => {
      const time = new Date(row.getValue('createdAt'))
      const formatted = new Intl.DateTimeFormat('en-US', {month: "short", day: "2-digit", year: "numeric"}).format(time)
      return (
      <div className="font-medium font-mono text-muted-foreground">
        {formatted}
      </div>
    )},
  },
  {
    accessorKey: 'updatedAt',
    header: 'Date updated',
    cell: ({ row }) => {
      const time = new Date(row.getValue('updatedAt'))
      const formatted = new Intl.DateTimeFormat('en-US', {month: "short", day: "2-digit", year: "numeric"}).format(time)
      return (
      <div className="font-medium font-mono text-muted-foreground">
        {formatted}
      </div>
    )},
  },
]

export default function AnalyticsTable({ data }: { data: Array<Transaction> }) {
  return (
    <DataTable data={data} columns={columns} />
  )
}
