"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, ShoppingCart, Radio } from "lucide-react";
import type { AvailableDigitalBillboard } from "@/server/billboards/entities/available_digital_billboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { computeDigitalLinePrice } from "@/lib/digital-spots";
import ImageViewerBasic from "@/components/commerce-ui/image-viewer-basic";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { DIGITAL_SPOT_OPTIONS, type DigitalSpotOption } from "@/lib/digital-spots";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    currencyDisplay: "code",
  }).format(value);
}

export function DigitalBillboardCard({
  billboard,
  from,
  to,
  defaultSpotCount,
}: {
  billboard: AvailableDigitalBillboard;
  from: string;
  to: string;
  defaultSpotCount: DigitalSpotOption;
}) {
  const allowedSpots = React.useMemo(
    () =>
      DIGITAL_SPOT_OPTIONS.filter((n) => n <= billboard.spotsRemaining),
    [billboard.spotsRemaining]
  );

  const [spotCount, setSpotCount] = React.useState<number>(() => {
    if (allowedSpots.includes(defaultSpotCount)) return defaultSpotCount;
    return allowedSpots[0] ?? defaultSpotCount;
  });

  React.useEffect(() => {
    const allowed = DIGITAL_SPOT_OPTIONS.filter(
      (n) => n <= billboard.spotsRemaining
    );
    if (allowed.length === 0) return;
    const preferred = allowed.includes(defaultSpotCount)
      ? defaultSpotCount
      : allowed[0]!;
    setSpotCount((prev) =>
      (allowed as readonly number[]).includes(prev) ? prev : preferred
    );
  }, [defaultSpotCount, billboard.spotsRemaining]);

  const linePrice = computeDigitalLinePrice(
    billboard.price,
    billboard.maxSpots,
    spotCount
  );

  const hasCoords =
    Number.isFinite(billboard.latitude) && Number.isFinite(billboard.longitude);
  const mapsHref = hasCoords
    ? `https://www.google.com/maps?q=${billboard.latitude},${billboard.longitude}`
    : null;

  const addToCart = () => {
    const { addItem } = useCartStore.getState();
    addItem({
      kind: "digital",
      digitalBillboardId: billboard.id,
      spotCount,
      billboardCode: billboard.code,
      reference: billboard.name,
      departmentName: billboard.departmentName,
      cityName: null,
      address: billboard.address,
      price: linePrice,
      imageUrl: billboard.imageUrl,
      from,
      to,
    });
  };

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden border-border/70 bg-card/90 py-0 shadow-sm shadow-black/5 backdrop-blur-sm">
      <div className="relative z-50 aspect-16/10 w-full shrink-0 overflow-hidden bg-muted">
        {billboard.imageUrl ? (
          <ImageViewerBasic
            imageUrl={billboard.imageUrl}
            imageTitle={billboard.name}
            className="h-full w-full"
            classNameThumbnailViewer="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--muted),transparent)]" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="flex items-center gap-1.5 truncate text-base font-semibold text-background">
            <Radio className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{billboard.code}</span>
          </div>
          <div className="shrink-0 rounded-md bg-background px-2.5 py-1 text-sm font-semibold text-foreground shadow-xs">
            {formatMoney(linePrice)}
          </div>
        </div>
      </div>

      <CardHeader className="shrink-0 gap-1.5 pb-3">
        <CardTitle className="text-sm font-semibold leading-tight">
          {billboard.name}
        </CardTitle>
        <div className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {[billboard.address, billboard.departmentName]
            .filter(Boolean)
            .join(", ") || "—"}
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Cupo en período:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {billboard.spotsRemaining}/{billboard.maxSpots}
            </span>
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Spots del paquete
          </label>
          <Select
            value={String(spotCount)}
            onValueChange={(v) => setSpotCount(Number(v))}
          >
            <SelectTrigger className="w-full border-border/70 bg-background/80 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedSpots.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} spots
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mapsHref && (
            <Link
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex min-h-[40px] items-center justify-center rounded-md border border-border/70 bg-background/70 px-3 text-xs font-medium text-foreground shadow-xs transition-colors duration-200",
                "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              <MapPin className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Mapa
            </Link>
          )}
        </div>
      </CardContent>

      <div className="mt-auto flex shrink-0 justify-center px-6 pb-4">
        <Button
          onClick={addToCart}
          variant="default"
          className="w-full max-w-[200px] cursor-pointer sm:w-fit"
          disabled={allowedSpots.length === 0}
        >
          <ShoppingCart className="size-3.5" aria-hidden />
          Añadir al carrito
        </Button>
      </div>
    </Card>
  );
}
