"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AvailableState } from "@/server/billboards/entities/available_billboard";

interface StateSelectProps {
  states: AvailableState[];
  selectedDepartamentoId: number | null;
  onStartLoading?: (departmentId: number) => void;
  isLoading?: boolean;
}

export function StateSelect({
  states,
  selectedDepartamentoId,
  onStartLoading,
  isLoading,
}: StateSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isPending = !!isLoading;

  const value = selectedDepartamentoId
    ? String(selectedDepartamentoId)
    : undefined;

  function onChange(next: string) {
    const nextId = Number(next);
    if (Number.isFinite(nextId)) {
      onStartLoading?.(nextId);
    }
    const params = new URLSearchParams(searchParams?.toString());
    params.set("stateId", next);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-foreground">Municipio</label>
      </div>
      <Select value={value} onValueChange={onChange} disabled={isPending}>
        <SelectTrigger className="w-full border-none shadow-md dark:bg-input bg-input cursor-pointer">
          <SelectValue placeholder="Selecciona un departamento" />
        </SelectTrigger>
        <SelectContent>
          {states.map((s) => (
            <SelectItem key={s.departmentId} value={String(s.departmentId)}>
              <span className="flex w-full items-center justify-between gap-3">
                <span className="truncate">{s.departmentName}</span>
                <span className="text-muted-foreground tabular-nums text-xs">
                  {s.availableCount}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
