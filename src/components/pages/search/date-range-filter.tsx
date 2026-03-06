"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn, parseYYYYMMDD, toYYYYMMDD, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function DateRangeFilter({
  from,
  to,
  onRangeChange,
  disabled,
  className,
  isLoading,
}: DateRangeFilterProps) {
  const fromDate = React.useMemo(() => parseYYYYMMDD(from), [from]);
  const toDate = React.useMemo(() => parseYYYYMMDD(to), [to]);
  const [timeZone, setTimeZone] = React.useState<string | undefined>(undefined);

  const handleSelectFrom = (date: Date | undefined) => {
    if (!date) return;
    const nextFrom = toYYYYMMDD(date);
    const currentTo = toDate ?? date;
    const coercedTo = date.getTime() > currentTo.getTime() ? date : currentTo;
    const nextTo = toYYYYMMDD(coercedTo);
    onRangeChange(nextFrom, nextTo);
  };

  const handleSelectTo = (date: Date | undefined) => {
    if (!date) return;
    const nextTo = toYYYYMMDD(date);
    const currentFrom = fromDate ?? date;
    const coercedFrom =
      date.getTime() < currentFrom.getTime() ? date : currentFrom;
    const nextFrom = toYYYYMMDD(coercedFrom);
    onRangeChange(nextFrom, nextTo);
  };

  React.useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Desde</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="inline-flex w-full items-center justify-between px-2.5 py-2 text-left text-sm font-normal border-none shadow-md dark:bg-input bg-input cursor-pointer"
              disabled={disabled || isLoading}
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="size-4" aria-hidden />
                <span className="truncate">
                  {fromDate ? formatDate(fromDate) : "Selecciona fecha"}
                </span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate ?? undefined}
              onSelect={handleSelectFrom}
              defaultMonth={fromDate ?? undefined}
              captionLayout="label"
              timeZone={timeZone ?? "UTC"}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Hasta</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="inline-flex w-full items-center justify-between px-2.5 py-2 text-left text-sm font-normal border-none shadow-md dark:bg-input bg-input cursor-pointer"
              disabled={disabled || isLoading}
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="size-4" aria-hidden />
                <span className="truncate">
                  {toDate ? formatDate(toDate) : "Selecciona fecha"}
                </span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate ?? undefined}
              onSelect={handleSelectTo}
              defaultMonth={toDate ?? fromDate ?? undefined}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
