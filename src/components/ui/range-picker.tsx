"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

export interface DatePickerWithRangeProps {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function DatePickerWithRange({
  value,
  onChange,
  label = "Date Picker Range",
  disabled,
  id = "date-picker-range",
  className,
}: DatePickerWithRangeProps) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(
    () => ({
      from: new Date(new Date().getFullYear(), 0, 20),
      to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
    })
  );

  const selected = value ?? internalDate;

  const handleSelect = (next: DateRange | undefined) => {
    if (!value) {
      setInternalDate(next);
    }
    onChange?.(next);
  };

  return (
    <Field className={className ?? "mx-auto w-60"}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className="justify-start px-2.5 font-normal"
            disabled={disabled}
          >
            <CalendarIcon data-icon="inline-start" />
            {selected?.from ? (
              selected.to ? (
                <>
                  {format(selected.from, "LLL dd, y")} -{" "}
                  {format(selected.to, "LLL dd, y")}
                </>
              ) : (
                format(selected.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={selected?.from}
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
