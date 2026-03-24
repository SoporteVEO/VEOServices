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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Info } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

type PurchaseItem = {
  id: string;
  billboardId: number | null;
  digitalBillboardId: string | null;
  spotCount: number | null;
  billboardCode: string | null;
  reference: string | null;
  departmentName: string | null;
  cityName: string | null;
  address: string | null;
  price: number | null;
  from: string;
  to: string;
};

export type PurchaseRow = {
  id: string;
  createdAt: string;
  status: string;
  paypalOrderId: string | null;
  customerEmail: string;
  customerName: string | null;
  items: PurchaseItem[];
};

interface PurchasesTableProps {
  purchases: PurchaseRow[];
}

function formatOrderShortId(id: string) {
  if (!id) return "—";
  return id.slice(-8).toUpperCase();
}

function formatDate(value: string) {
  try {
    return format(new Date(value), "d MMM yyyy, HH:mm", { locale: es });
  } catch {
    return value;
  }
}

function formatDateRange(from: string, to: string) {
  try {
    return `${format(new Date(from), "d MMM yyyy", { locale: es })} – ${format(
      new Date(to),
      "d MMM yyyy",
      { locale: es }
    )}`;
  } catch {
    return `${from} – ${to}`;
  }
}

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [active, setActive] = React.useState<PurchaseRow | null>(null);

  const columns = React.useMemo<ColumnDef<PurchaseRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Orden",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">
            #{formatOrderShortId(row.original.id)}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Cliente",
        cell: ({ row }) => (
          <div className="max-w-[220px]">
            <div className="truncate text-xs font-medium">
              {row.original.customerName || "—"}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {row.original.customerEmail}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                status === "COMPLETED" && "bg-emerald-100 text-emerald-700",
                status === "PENDING" && "bg-amber-100 text-amber-700",
                status === "FAILED" && "bg-destructive/10 text-destructive"
              )}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "total",
        header: "Total",
        cell: ({ row }) => {
          const total = row.original.items.reduce(
            (sum, i) => sum + (i.price ?? 0),
            0
          );
          return (
            <span className="text-xs font-semibold tabular-nums">
              {formatMoney(total)}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: purchases,
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
    <>
      <div className="space-y-4">
        <DataTable
          table={table}
          onRowClick={(row) => {
            setActive(row as PurchaseRow);
          }}
        >
          <div className="flex items-center justify-between">
            <Input
              placeholder="Buscar compras..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </DataTable>
        <div className="text-sm text-muted-foreground">
          Mostrando {purchases.length} compra(s)
        </div>
      </div>

      <Drawer
        direction="right"
        open={active != null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DrawerContent>
          {active && (
            <>
              <DrawerHeader className="flex items-start justify-between gap-2">
                <div>
                  <DrawerTitle className="flex items-center gap-2 text-base">
                    Detalle de compra
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-mono font-medium">
                      #{formatOrderShortId(active.id)}
                    </span>
                  </DrawerTitle>
                  <DrawerDescription className="mt-1 text-xs">
                    {active.customerEmail}
                  </DrawerDescription>
                </div>
              </DrawerHeader>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-2 text-sm">
                <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" aria-hidden />
                    <span>
                      Esta orden contiene {active.items.length}{" "}
                      {active.items.length === 1 ? "valla" : "vallas"}.
                    </span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {active.items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-border/60 bg-background/80 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">
                            {item.digitalBillboardId
                              ? (item.billboardCode ?? "Valla digital")
                              : (item.billboardCode ??
                                `Valla ${item.billboardId ?? "—"}`)}
                          </p>
                          {item.digitalBillboardId && item.spotCount != null && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {item.spotCount} spots
                            </p>
                          )}
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                            {item.reference ?? "—"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {[item.cityName, item.departmentName]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {formatDateRange(item.from, item.to)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right text-xs font-semibold tabular-nums">
                          {formatMoney(item.price)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <DrawerFooter className="border-t border-border/60 bg-card">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(
                      active.items.reduce((sum, i) => sum + (i.price ?? 0), 0)
                    )}
                  </span>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
