'use client'

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  PaginationState,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table'
import { ChevronDownIcon, ChevronUpIcon, LinkIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '#/lib/utils.ts'
import { Badge } from '#/components/ui/badge.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Checkbox } from '#/components/ui/checkbox.tsx'
import { Frame, FrameFooter } from '#/components/ui/frame.tsx'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx'
import type { Transaction } from "@baggit/api/app"

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
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  const [sorting, setSorting] = useState<SortingState>([
    {
      desc: false,
      id: 'departureTime',
    },
  ])

  const table = useReactTable({
    columns,
    data: data,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  })

  return (
    <Frame className="w-full">
      <Table variant="card" className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.getSize()
                return (
                  <TableHead
                    key={header.id}
                    style={
                      columnSize ? { width: `${columnSize}px` } : undefined
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: (
                            <ChevronUpIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                data-state={row.getIsSelected() ? 'selected' : undefined}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <FrameFooter className="p-2">
        <div className="flex items-center justify-between gap-2 max-h-[30px]">
          {/* Results range selector */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <p className="text-muted-foreground text-sm">Viewing</p>
            <Select
              // items={Array.from({ length: table.getPageCount() }, (_, i) => {
              //   const start = i * table.getState().pagination.pageSize + 1
              //   const end = Math.min(
              //     (i + 1) * table.getState().pagination.pageSize,
              //     table.getRowCount(),
              //   )
              //   const pageNum = i + 1
              //   return { label: `${start}-${end}`, value: pageNum }
              // })}
              onValueChange={(value) => {
                table.setPageIndex(Number(value) - 1)
              }}
              value={(table.getState().pagination.pageIndex + 1).toString()}
            >
              <SelectTrigger
                aria-label="Select result range"
                className="w-fit min-w-none"
                size="sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: table.getPageCount() }, (_, i) => {
                  const start = i * table.getState().pagination.pageSize + 1
                  const end = Math.min(
                    (i + 1) * table.getState().pagination.pageSize,
                    table.getRowCount(),
                  )
                  const pageNum = i + 1
                  return (
                    <SelectItem key={pageNum} value={pageNum.toString()}>
                      {`${start}-${end}`}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-sm">
              of{' '}
              <strong className="font-medium text-foreground">
                {table.getRowCount()}
              </strong>{' '}
              results
            </p>
          </div>

          {/* Pagination */}
          <Pagination className="justify-end h-fit">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="sm:*:[svg]:hidden"
                  render={
                    <Button
                      disabled={!table.getCanPreviousPage()}
                      onClick={() => table.previousPage()}
                      size="sm"
                      variant="outline"
                    />
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="sm:*:[svg]:hidden"
                  render={
                    <Button
                      disabled={!table.getCanNextPage()}
                      onClick={() => table.nextPage()}
                      size="sm"
                      variant="outline"
                    />
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </FrameFooter>
    </Frame>
  )
}
