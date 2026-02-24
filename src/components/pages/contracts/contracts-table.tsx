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
import type { EndingSoonContracts } from "@/server/contracts/entities/ending_soon_contracts";
import { formatDate } from "@/lib/utils";

type ContractRow = Omit<EndingSoonContracts, "start_date" | "end_date"> & {
  start_date: Date | string;
  end_date: Date | string;
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
        accessorKey: "contract_number",
        header: "Código",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.getValue("contract_number") ?? "—"}
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
        accessorKey: "customer_name",
        header: "Cliente",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.getValue("customer_name") ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground">
              {row.original.customer_email ?? "—"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "billboard_address",
        header: "Dirección valla",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.getValue("billboard_address") ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "start_date",
        header: "Inicio",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.getValue("start_date"))}
          </span>
        ),
      },
      {
        accessorKey: "end_date",
        header: "Vencimiento",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatDate(row.getValue("end_date"))}
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
