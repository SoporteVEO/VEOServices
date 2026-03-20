"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import Image from "next/image";
import { Plus } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type DigitalBillboardRow = {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  imageThumbnailUrl: string | null;
  maxSpots: number;
  createdAt: string;
  updatedAt: string;
};

interface DigitalBillboardsTableProps {
  initialRows: DigitalBillboardRow[];
}

function formatDate(value: string) {
  try {
    return format(new Date(value), "d MMM yyyy, HH:mm", { locale: es });
  } catch {
    return value;
  }
}

export function DigitalBillboardsTable({
  initialRows,
}: DigitalBillboardsTableProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState<DigitalBillboardRow[]>(initialRows);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [latitude, setLatitude] = React.useState("");
  const [longitude, setLongitude] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const resetForm = () => {
    setCode("");
    setName("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setPrice("");
    setImageFile(null);
    setFormError(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("code", code.trim());
      form.append("name", name.trim());
      form.append("address", address.trim());
      form.append("latitude", latitude.trim());
      form.append("longitude", longitude.trim());
      form.append("price", price.trim());
      if (imageFile) {
        form.append("image", imageFile);
      }

      const res = await fetch("/api/digital-billboards", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        data?: DigitalBillboardRow;
        error?: string;
      };

      if (!res.ok) {
        setFormError(json.error || "No se pudo crear la valla");
        return;
      }

      if (json.data) {
        setRows((prev) => [json.data!, ...prev]);
        setOpen(false);
        resetForm();
      }
    } catch {
      setFormError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = React.useMemo<ColumnDef<DigitalBillboardRow>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        cell: ({ row }) => {
          const src = row.original.imageThumbnailUrl;
          if (!src) {
            return (
              <div className="flex h-10 w-14 items-center justify-center rounded border bg-muted text-[10px] text-muted-foreground">
                —
              </div>
            );
          }
          return (
            <Image
              src={src}
              alt=""
              width={56}
              height={40}
              unoptimized
              className="h-10 w-14 rounded border object-cover"
            />
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "code",
        header: "Código",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Nombre",
      },
      {
        accessorKey: "address",
        header: "Dirección",
        cell: ({ row }) => (
          <span className="max-w-[240px] truncate block">
            {row.original.address}
          </span>
        ),
      },
      {
        accessorKey: "latitude",
        header: "Lat",
        cell: ({ row }) => row.original.latitude.toFixed(5),
      },
      {
        accessorKey: "longitude",
        header: "Lng",
        cell: ({ row }) => row.original.longitude.toFixed(5),
      },
      {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => formatMoney(row.original.price),
      },
      {
        accessorKey: "createdAt",
        header: "Creado",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
  });

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nueva valla digital</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                ) : null}
                <div className="grid gap-2">
                  <Label htmlFor="db-code">Código *</Label>
                  <Input
                    id="db-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="db-name">Nombre *</Label>
                  <Input
                    id="db-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="db-address">Dirección *</Label>
                  <Input
                    id="db-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="db-lat">Latitud *</Label>
                    <Input
                      id="db-lat"
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="db-lng">Longitud *</Label>
                    <Input
                      id="db-lng"
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="db-price">Precio *</Label>
                  <Input
                    id="db-price"
                    type="number"
                    step="any"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="db-image">Imagen (opcional)</Label>
                  <Input
                    id="db-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando…" : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        table={table}
        onRowClick={(row) => {
          router.push(`/dashboard/digital-billboards/${row.id}`);
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Buscar por código, nombre o dirección…"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <Button
            type="button"
            className="gap-2 shrink-0"
            onClick={() => handleOpenChange(true)}
          >
            <Plus className="h-4 w-4" />
            Agregar valla
          </Button>
        </div>
      </DataTable>
    </>
  );
}
