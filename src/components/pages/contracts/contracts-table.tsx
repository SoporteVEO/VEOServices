"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import type { EndingSoonContracts } from "@/server/contracts/entities/source_ending_soon_contracts";
import { formatDate } from "@/lib/utils";

type ContractRow = Omit<EndingSoonContracts, "startDate" | "endDate"> & {
  startDate: Date | string;
  endDate: Date | string;
};

interface ContractsTableProps {
  contracts: ContractRow[];
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<ContractRow>[]>(
    () => [
      {
        accessorKey: "contractNumber",
        header: "Código",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.getValue("contractNumber") ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Atención a",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.getValue("description") ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Cliente",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.getValue("customerName") ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground">
              {row.original.customerEmail ?? "—"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "billboardAddress",
        header: "Dirección valla",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.getValue("billboardAddress") ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "endDate",
        header: "Vencimiento",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatDate(row.getValue("endDate"))}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: contracts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        <div className="flex items-center justify-between">
          <Input
            placeholder="Buscar contratos..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </DataTable>
      <div className="text-sm text-muted-foreground">
        Mostrando {contracts.length} contrato(s)
      </div>
    </div>
  );
}
