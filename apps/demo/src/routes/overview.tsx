import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { betterFetch } from "@better-fetch/fetch";
import { createContext, useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconCircleX,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
} from "@tabler/icons-react";
import type { FC } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table as TableType,
  VisibilityState,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  DraggableRow,
  DragHandle,
  TransactionTableCellViewer,
} from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ExtendedTransaction, Transaction } from "@afsnk/pay-server/types";

import { flexRender } from "@tanstack/react-table";
import { Container, Main, Section } from "@/components/craft";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// import { UniqueIdentifier } from "@dnd-kit/core";

export const TransactionTableContext = createContext<{
  table: TableType<Transaction>;
}>({ table: {} as any });

const defaultColumns: Array<ColumnDef<Transaction>> = [
  // {
  //   id: 'drag',
  //   header: () => null,
  //   cell: ({ row }) => <DragHandle id={row.original.id} />,
  // },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => {
      return <TransactionTableCellViewer item={row.original} />;
      return <span>{row.original.reference}</span>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "complete" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : row.original.status === "pending" ? (
          <IconLoader />
        ) : (
          <IconCircleX className="fill-red-500 dark:fill-red-400" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    header: "Address",
    cell: ({ row }) => (
      <span>{row.original.vAddress}</span>
    ),
  },
  {
    header: "Explorer",
    cell: ({ row }) => (
      <a href={row.original.network === "bsc"
        ? `https://bscscan.com/address/${row.original.vAddress}`
        : `https://basescan.org/address/${row.original.vAddress}`}>{
          row.original.vAddress?.slice(0, 6)}...{row.original.vAddress?.slice(-6)
        }</a>
    ),
  },
  {
    accessorKey: "network",
    header: () => "Network",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.network}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: () => "Amount",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.amount}
      </Badge>
    ),
  },
  {
    accessorKey: "asset",
    header: () => "Asset",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.asset}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => "Date",
    cell: ({ row }) => (
      <span className="flex items-center justify-center">
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "long",
          timeStyle: "medium",
        }).format(new Date(row.original.createdAt!))}{" "}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(row.original.vAddress!)
            toast.info('Virtual address copied!')
          }}>Copy address</DropdownMenuItem>
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              window.alert(`Alert for ID: ${row.original.id}`);
            }}
          >
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const Route = createFileRoute("/overview")({
  component: RouteComponent,
  errorComponent: ({ error }) => (
    <div>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  ),
  loader: async () => {
    const { data, error } = await betterFetch<
      (Transaction & { hasBalance: boolean; balance: string | number })[]
    >(
      `${import.meta.env.DEV
        ? "http://localhost:9999"
        : "https://afsnk-pay-server.fly.dev"
      }/payment/transactions`,
    );
    if (error) {
      console.log("Failed to fetch transactions", { error });
      throw error;
    }
    return data;
  },
  preload: true,
});

function RouteComponent() {
  const data = Route.useLoaderData();

  const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    onStateChange: (tableState) => {
      console.log("Table [onChangeState]", tableState);
    },
    getRowId: (row: any) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    console.log("monitor pagination state", pagination);

    return () => {
      console.log("Transaction table unmounted, cleanup...");
    };
  }, [pagination]);

  const contextValue = useMemo(
    () => ({ table, pagination }),
    [table, pagination],
  );

  const dataIds = useMemo<Array<Transaction>>(
    () => data?.map(({ id }) => id),
    [data],
  );

  return (
    <Main>
      <Section>
        <Container>
          <Table className="animate-fade-down">
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 my-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => {
                    table.nextPage();
                    console.log("Current table state", table.getState());
                  }}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Main>
  );
}
