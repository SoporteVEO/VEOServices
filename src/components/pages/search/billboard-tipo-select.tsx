"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillboardTipoSelectProps {
  value: "estatica" | "digital";
  isLoading?: boolean;
}

export function BillboardTipoSelect({
  value,
  isLoading,
}: BillboardTipoSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pending = !!isLoading;

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams?.toString());
    if (next === "estatica") {
      params.delete("tipo");
      params.delete("spots");
    } else {
      params.set("tipo", "digital");
      if (!params.get("spots")) {
        params.set("spots", "300");
      }
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Tipo de valla</label>
      <Select value={value} onValueChange={onChange} disabled={pending}>
        <SelectTrigger className="w-full border-none shadow-md dark:bg-input bg-input cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="estatica">Vallas estáticas</SelectItem>
          <SelectItem value="digital">Vallas digitales</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
