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
import { formatDate } from "@/lib/utils";
import type { NotifiedContract } from "@/generated/prisma/browser";
import { NotificationStatus } from "@/generated/prisma/browser";

type NotifiedRow = Omit<
  NotifiedContract,
  "createdAt" | "updatedAt" | "errorMessage"
> & {
  createdAt: Date | string;
  updatedAt: Date | string;
  errorMessage: string | null | undefined;
};

interface NotifiedContractsTableProps {
  contracts: NotifiedRow[];
}

function StatusBadge({ status }: { status: NotificationStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const cls =
    status === NotificationStatus.SENT
      ? "bg-emerald-500/90 text-white"
      : status === NotificationStatus.FAILED
        ? "bg-red-500/90 text-white"
        : "bg-amber-500/90 text-white";
  const label =
    status === NotificationStatus.SENT
      ? "Enviado"
      : status === NotificationStatus.FAILED
        ? "Fallido"
        : "Pendiente";

  return <span className={`${base} ${cls}`}>{label}</span>;
}

export function NotifiedContractsTable({
  contracts,
}: NotifiedContractsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<NotifiedRow>[]>(
    () => [
      {
        accessorKey: "contractNumber",
        header: "Numero de contrato",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.getValue("contractNumber")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
          <StatusBadge status={row.getValue("status") as NotificationStatus} />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Fecha de notificación",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.getValue("createdAt"))}
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
            placeholder="Buscar notificaciones..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </DataTable>
      <div className="text-sm text-muted-foreground">
        Mostrando {contracts.length} notificación(es)
      </div>
    </div>
  );
}
