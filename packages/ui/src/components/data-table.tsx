"use client";

import * as React from "react";
import {
  FlexRender,
  useTable,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";

export const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

export type DataTableColumnDef<TData extends RowData, TValue = any> = ColumnDef<
  typeof features,
  TData,
  TValue
>;

import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/ui/button";
import { Label } from "@repo/ui/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/ui/table";
import {
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  Loader2,
} from "lucide-react";

export interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: DataTableColumnDef<TData>[];
  showPagination?: boolean;
  isPending?: boolean;
  perPage?: number;
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData extends { id: string | number }>({
  data,
  columns,
  showPagination = true,
  isPending,
  perPage = 10,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData>) {
  const isControlled = pageIndex !== undefined && pageSize !== undefined;

  const [localPagination, setLocalPagination] = React.useState({
    pageIndex: 0,
    pageSize: showPagination ? perPage : 999999,
  });

  const pagination = React.useMemo(() => {
    if (isControlled) {
      return { pageIndex, pageSize };
    }
    return localPagination;
  }, [isControlled, pageIndex, pageSize, localPagination]);

  const handlePaginationChange = React.useCallback(
    (updater: any) => {
      if (isControlled) {
        const next =
          typeof updater === "function" ? updater(pagination) : updater;
        if (next.pageIndex !== pagination.pageIndex) {
          onPageChange?.(next.pageIndex);
        }
        if (next.pageSize !== pagination.pageSize) {
          onPageSizeChange?.(next.pageSize);
        }
      } else {
        setLocalPagination(updater);
      }
    },
    [isControlled, pagination, onPageChange, onPageSizeChange],
  );

  const [prevPerPage, setPrevPerPage] = React.useState(perPage);
  const [prevShowPagination, setPrevShowPagination] =
    React.useState(showPagination);

  if (
    !isControlled &&
    (perPage !== prevPerPage || showPagination !== prevShowPagination)
  ) {
    setPrevPerPage(perPage);
    setPrevShowPagination(showPagination);
    setLocalPagination((prev) => ({
      ...prev,
      pageSize: showPagination ? perPage : 999999,
    }));
  }

  const table = useTable({
    features,
    data,
    columns,
    state: {
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    pageCount: pageCount,
    manualPagination: isControlled,
    onPaginationChange: handlePaginationChange,
  });

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader className={cn("sticky top-0 z-10 bg-muted/30")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn("px-4", (header.column.columnDef.meta as any)?.className)}
                    >
                      {header.isPlaceholder ? null : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "h-12 px-4",
                        (cell.column.columnDef.meta as any)?.className,
                      )}
                    >
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  {isPending ? (
                    <Loader2 className="size-6 animate-spin text-primary mx-auto" />
                  ) : (
                    "Tidak ada data."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-end mt-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Per halaman
              </Label>
              <Select
                value={`${table.state.pagination.pageSize}`}
                onValueChange={(value) => {
                  if (value) table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.state.pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Halaman {table.state.pagination.pageIndex + 1} /{" "}
              {table.getPageCount() || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Halaman pertama</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Halaman sebelumnya</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Halaman berikutnya</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Halaman terakhir</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
