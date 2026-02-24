"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { UserForm, type UserFormData } from "./user-form";
import { DeleteUserDialog } from "./delete-user-dialog";
import { User } from "@/generated/prisma/browser";
import { format } from "date-fns";

interface UsersTableProps {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  onRefresh: () => void;
}

export function UsersTable({
  users,
  total,
  page,
  pageSize,
  pageCount,
  onRefresh,
}: UsersTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "Nombre",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName || ""}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                role === "ADMIN"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: "emailVerified",
        header: "Verificado",
        cell: ({ row }) => {
          const verified = row.getValue("emailVerified") as boolean;
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                verified ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              {verified ? "Si" : "No"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Creado",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <span className="text-sm text-muted-foreground">
              {format(date, "dd/MM/yyyy")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedUser(user);
                  setEditDialogOpen(true);
                }}
                className="h-8 w-8"
              >
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">Editar usuario</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedUser(user);
                  setDeleteDialogOpen(true);
                }}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Eliminar usuario</span>
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    manualPagination: true,
    pageCount,
  });

  const handleCreateUser = async (data: UserFormData) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al crear usuario");
    }

    onRefresh();
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    const response = await fetch(`/api/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al actualizar usuario");
    }

    onRefresh();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const response = await fetch(`/api/users/${selectedUser.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al eliminar usuario");
    }

    onRefresh();
  };

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar usuarios..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Agregar Usuario
          </Button>
        </div>
      </DataTable>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {users.length} de {total} usuarios
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = Math.max(1, page - 1);
              router.push(
                `/dashboard/users?page=${newPage}&pageSize=${pageSize}`
              );
            }}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {page} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = Math.min(pageCount, page + 1);
              router.push(
                `/dashboard/users?page=${newPage}&pageSize=${pageSize}`
              );
            }}
            disabled={page >= pageCount}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <UserForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateUser}
        mode="create"
      />

      <UserForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdateUser}
        initialData={
          selectedUser
            ? {
                ...selectedUser,
                lastName: selectedUser.lastName || "",
              }
            : undefined
        }
        mode="edit"
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteUser}
        userName={
          selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName || ""}`.trim()
            : ""
        }
      />
    </div>
  );
}
