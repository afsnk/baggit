'use client'


import type {
  ColumnDef,
} from '@tanstack/react-table'

import { cn } from '#/lib/utils.ts'
import { Badge } from '#/components/ui/badge.tsx'
import { Checkbox } from '#/components/ui/checkbox.tsx'
import { DataTable } from './data-table'
import { Clock } from 'lucide-react'

type APIKey = {
  metadata: Record<string, any> | null
  permissions: {
    [key: string]: string[]
  } | null
  id: string
  configId: string
  name: string | null
  start: string | null
  prefix: string | null
  referenceId: string
  refillInterval: number | null
  refillAmount: number | null
  lastRefillAt: Date | null
  enabled: boolean
  rateLimitEnabled: boolean
  rateLimitTimeWindow: number | null
  rateLimitMax: number | null
  requestCount: number
  remaining: number | null
  lastRequest: Date | null
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const getStatusColor = (status: APIKey['enabled']) => {
  switch (status) {
    case true:
      return 'bg-emerald-500'
    case false:
      return 'bg-red-500'
    default:
      return 'bg-muted-foreground/64'
  }
}

const columns: ColumnDef<APIKey>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
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
    accessorKey: 'name',
    cell: ({ row }) => (
      <div className="font-medium font-mono text-muted-foreground">
        {row.getValue('name')}
      </div>
    ),
    header: 'Name',
    size: 120,
  },
  {
    accessorKey: 'enabled',
    cell: ({ row }) => {
      const status: boolean = row.getValue('enabled')
      return (
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className={cn('size-1.5 rounded-full', getStatusColor(status))}
          />
          {status ? 'Active' : 'InActive'}
        </Badge>
      )
    },
    header: 'Status',
    size: 60,
  },
  {
    accessorKey: 'lastRequest',
    cell: ({ row }) => {
      const date: Date | null = row.getValue('lastRequest')
      return (
        <Badge className="font-normal tabular-nums" size="lg" variant="outline">
          <Clock />
          <span>{date?.toLocaleString()}</span>
        </Badge>
      )
    },
    header: 'Last Request',
    size: 120,
  },
  {
    accessorKey: 'configId',
    header: 'Key type',
  },
  // {
  //   accessorKey: 'createdAt',
  //   header: 'Date created',
  //   size: 80,
  // },
  // {
  //   accessorKey: 'updateedAt',
  //   header: 'Date updated',
  //   size: 80,
  // },
]

export default function APIKeyTable({ data }: { data: Array<APIKey> }) {
  return (
    <DataTable columns={columns} data={data} />
  )
}
