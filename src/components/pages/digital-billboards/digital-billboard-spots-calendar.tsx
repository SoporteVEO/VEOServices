"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { endOfMonth, startOfMonth } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

type UsageRow = {
  id: string;
  timestamp: string;
  duration: number;
  campaignName: string | null;
  campaignDescription: string | null;
};

function aggregateSpotsByLocalDay(usages: UsageRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const u of usages) {
    const d = new Date(u.timestamp);
    const key = format(d, "yyyy-MM-dd");
    map.set(key, (map.get(key) ?? 0) + u.duration);
  }
  return map;
}

function getSpotDayStyle(
  spots: number,
  maxSpots: number
): "green" | "yellow" | "red" {
  if (spots >= maxSpots) return "red";
  if (spots < 300) return "green";
  if (spots < 600) return "yellow";
  return "red";
}

const spotStyleClass: Record<"green" | "yellow" | "red", string> = {
  green:
    "!bg-emerald-500/50 !text-emerald-950 hover:!bg-emerald-500/35 active:!bg-emerald-500/30 focus-visible:!bg-emerald-500/30 dark:!text-emerald-50",
  yellow:
    "!bg-amber-400/35 !text-amber-950 hover:!bg-amber-400/45 active:!bg-amber-400/40 focus-visible:!bg-amber-400/40 dark:!text-amber-50",
  red: "!bg-red-500/30 !text-red-950 hover:!bg-red-500/40 active:!bg-red-500/35 focus-visible:!bg-red-500/35 dark:!text-red-50",
};

type DigitalBillboardSpotsCalendarProps = {
  billboardId: string;
  code: string;
  name: string;
  maxSpots: number;
};

export function DigitalBillboardSpotsCalendar({
  billboardId,
  code,
  name,
  maxSpots,
}: DigitalBillboardSpotsCalendarProps) {
  const router = useRouter();
  const [month, setMonth] = React.useState<Date>(() => new Date());
  const [usages, setUsages] = React.useState<UsageRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [localDateTime, setLocalDateTime] = React.useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = React.useState("300");
  const [campaignName, setCampaignName] = React.useState("");
  const [campaignDescription, setCampaignDescription] = React.useState("");
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);

  const spotsByDay = React.useMemo(
    () => aggregateSpotsByLocalDay(usages),
    [usages]
  );

  const selectedDayUsages = React.useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return usages.filter((u) => {
      const dayKey = format(new Date(u.timestamp), "yyyy-MM-dd");
      return dayKey === key;
    });
  }, [selectedDay, usages]);

  const selectedDaySpots = React.useMemo(() => {
    if (!selectedDay) return 0;
    return selectedDayUsages.reduce((sum, u) => sum + u.duration, 0);
  }, [selectedDay, selectedDayUsages]);

  const loadUsages = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const from = startOfMonth(month);
      const to = endOfMonth(month);
      const res = await fetch(
        `/api/digital-billboards/${billboardId}/spots?from=${encodeURIComponent(
          from.toISOString()
        )}&to=${encodeURIComponent(to.toISOString())}`
      );
      const json = (await res.json()) as {
        data?: UsageRow[];
        error?: string;
      };
      if (!res.ok) {
        setLoadError(json.error || "No se pudieron cargar los datos");
        setUsages([]);
        return;
      }
      setUsages(json.data ?? []);
    } catch {
      setLoadError("Error de red");
      setUsages([]);
    } finally {
      setLoading(false);
    }
  }, [billboardId, month]);

  React.useEffect(() => {
    void loadUsages();
  }, [loadUsages]);

  const SpotsDayButton = React.useMemo(() => {
    function Btn(props: React.ComponentProps<typeof CalendarDayButton>) {
      const { day, className, children: _ignored, onClick, ...rest } = props;
      const key = format(day.date, "yyyy-MM-dd");
      const spots = spotsByDay.get(key) ?? 0;
      const style = getSpotDayStyle(spots, maxSpots);
      const cls = spotStyleClass[style];

      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedDay(day.date);
        onClick?.(e);
      };

      return (
        <CalendarDayButton
          {...rest}
          day={day}
          onClick={handleClick}
          className={cn(
            "flex min-h-(--cell-size) flex-col gap-0.5 py-1",
            className,
            cls
          )}
        >
          <span className="text-sm font-medium leading-none">
            {day.date.getDate()}
          </span>
          {spots > 0 ? (
            <span className="text-[10px] font-semibold leading-none opacity-90">
              {spots} sp
            </span>
          ) : (
            <span className="text-[10px] opacity-40">·</span>
          )}
        </CalendarDayButton>
      );
    }
    return Btn;
  }, [spotsByDay, maxSpots]);

  const handleAddSpots = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const d = Number(duration);
    if (!Number.isFinite(d) || d <= 0) {
      setFormError("Indica una duración (spots) válida");
      return;
    }
    setSubmitting(true);
    try {
      const ts = new Date(localDateTime);
      if (Number.isNaN(ts.getTime())) {
        setFormError("Fecha u hora no válida");
        return;
      }
      const res = await fetch(`/api/digital-billboards/${billboardId}/spots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: ts.toISOString(),
          duration: d,
          campaignName: campaignName.trim() || null,
          campaignDescription: campaignDescription.trim() || null,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFormError(json.error || "No se pudo guardar");
        return;
      }
      setAddOpen(false);
      await loadUsages();
      router.refresh();
    } catch {
      setFormError("Error de red");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Código{" "}
            <span className="font-mono font-medium text-foreground">
              {code}
            </span>
          </p>
          <h2 className="text-xl font-semibold tracking-tight">{name}</h2>
        </div>
        <Button
          type="button"
          className="shrink-0 gap-2"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Agregar Spots
        </Button>
      </div>

      {loadError ? (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="w-full overflow-x-auto">
        <div className="w-full rounded-xl p-4 shadow-sm md:p-8">
          {loading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Cargando calendario…
            </p>
          ) : (
            <div className="w-full">
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                required={false}
                locale={es}
                className="w-full [--cell-size:2.75rem] sm:[--cell-size:3.5rem] md:[--cell-size:5rem]"
                classNames={{
                  day: "w-full p-1.5 aspect-video",
                  month_caption: "w-full text-center capitalize mb-8",
                }}
                components={{
                  DayButton: SpotsDayButton,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-emerald-500/35 ring-1 ring-border" />
          &lt; 300 spots
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-amber-400/40 ring-1 ring-border" />
          &gt; 300 y &lt; 600
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-red-500/35 ring-1 ring-border" />
          600+ o día lleno / 900
        </span>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddSpots}>
            <DialogHeader>
              <DialogTitle>Agregar spots</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {formError ? (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="spot-ts">Fecha y hora</Label>
                <Input
                  id="spot-ts"
                  type="datetime-local"
                  value={localDateTime}
                  onChange={(e) => setLocalDateTime(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="spot-duration">Spots (duración)</Label>
                <Input
                  id="spot-duration"
                  type="number"
                  min={1}
                  max={maxSpots}
                  step={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="spot-campaign">Campaña (opcional)</Label>
                <Input
                  id="spot-campaign"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="spot-desc">Descripción (opcional)</Label>
                <Input
                  id="spot-desc"
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
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

      <Drawer
        direction="right"
        open={selectedDay != null}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null);
        }}
      >
        <DrawerContent>
          {selectedDay && (
            <>
              <DrawerHeader className="flex items-start justify-between gap-2">
                <div>
                  <DrawerTitle className="flex items-center gap-2 text-base">
                    Spots del día
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                      {format(selectedDay, "d MMM yyyy", { locale: es })}
                    </span>
                  </DrawerTitle>
                  <DrawerDescription className="mt-1 text-xs">
                    {selectedDaySpots} / {maxSpots} spots utilizados
                  </DrawerDescription>
                </div>
              </DrawerHeader>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-2 text-sm">
                {selectedDayUsages.length === 0 ? (
                  <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground text-center">
                    No hay spots registrados para este día
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {selectedDayUsages.map((usage) => (
                      <li
                        key={usage.id}
                        className="rounded-lg border border-border/60 bg-background/80 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {usage.campaignName && (
                              <p className="text-xs font-semibold text-foreground">
                                {usage.campaignName}
                              </p>
                            )}
                            {usage.campaignDescription && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                {usage.campaignDescription}
                              </p>
                            )}
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {format(new Date(usage.timestamp), "HH:mm", {
                                locale: es,
                              })}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs font-semibold tabular-nums">
                              {usage.duration} sp
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <DrawerFooter className="border-t border-border/60 bg-card">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total del día</span>
                  <span className="font-semibold tabular-nums">
                    {selectedDaySpots} spots
                  </span>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
