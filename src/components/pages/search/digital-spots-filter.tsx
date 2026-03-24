"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIGITAL_SPOT_OPTIONS,
  type DigitalSpotOption,
} from "@/lib/digital-spots";

interface DigitalSpotsFilterProps {
  value: DigitalSpotOption;
  isLoading?: boolean;
}

export function DigitalSpotsFilter({
  value,
  isLoading,
}: DigitalSpotsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pending = !!isLoading;

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("spots", next);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Spots deseados
      </label>
      <Select value={String(value)} onValueChange={onChange} disabled={pending}>
        <SelectTrigger className="w-full border-none shadow-md dark:bg-input bg-input cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DIGITAL_SPOT_OPTIONS.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n} spots
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Solo se muestran vallas con cupo suficiente para el paquete elegido en
        las fechas indicadas.
      </p>
    </div>
  );
}
