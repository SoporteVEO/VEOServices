"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: "ADMIN" | "USER";
}

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: Partial<UserFormData> & { id?: string };
  mode: "create" | "edit";
}

export function UserForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: UserFormProps) {
  const [formData, setFormData] = React.useState<UserFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "USER",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setFormData({
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        email: initialData?.email || "",
        password: "",
        role: initialData?.role || "USER",
      });
      setError(null);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "create" && !formData.password) {
        setError("Password is required");
        setIsSubmitting(false);
        return;
      }

      await onSubmit(formData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Agregar nuevo usuario" : "Editar usuario"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crea una nueva cuenta de usuario con email y contraseña."
              : "Actualiza la información del usuario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
              placeholder="John"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Apellido
            </label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="correo@ejemplo.com"
            />
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña <span className="text-destructive">*</span>
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="********"
                minLength={8}
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Rol <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.role}
              onValueChange={(value: "ADMIN" | "USER") =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : mode === "create"
                  ? "Crear usuario"
                  : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
