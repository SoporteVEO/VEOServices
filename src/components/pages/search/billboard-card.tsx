import Link from "next/link";
import { MapPin, Ruler, Tag } from "lucide-react";
import type { AvailableBillboard } from "@/server/billboards/entities/available_billboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ImageViewerBasic from "@/components/commerce-ui/image-viewer-basic";

function formatMoney(value: number | null) {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
      currencyDisplay: "code",
      notation: "standard",
      compactDisplay: "short",
      currencySign: "standard",
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatSize(height: number | null, width: number | null) {
  if (height == null && width == null) return "—";
  const a = height == null ? "—" : String(height);
  const b = width == null ? "—" : String(width);
  return `${a} × ${b}`;
}

export function BillboardCard({
  billboard,
}: {
  billboard: AvailableBillboard;
}) {
  const hasCoords =
    billboard.latitude != null &&
    billboard.longitude != null &&
    Number.isFinite(billboard.latitude) &&
    Number.isFinite(billboard.longitude);

  const mapsHref = hasCoords
    ? `https://www.google.com/maps?q=${billboard.latitude},${billboard.longitude}`
    : null;

  return (
    <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm shadow-black/5 backdrop-blur-sm -py-6">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-muted z-50">
        {billboard.imageUrl ? (
          <ImageViewerBasic
            imageUrl={billboard.imageUrl}
            imageTitle={
              billboard.reference ?? billboard.billboardCode ?? "Vista de valla"
            }
            className="h-full w-full"
            classNameThumbnailViewer="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--muted),transparent)]" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="truncate text-base font-semibold text-background z-50">
            {billboard.billboardCode ?? "—"}
          </div>
          <div className="shrink-0 rounded-md bg-background px-2.5 py-1 text-sm font-semibold text-foreground shadow-xs">
            {formatMoney(billboard.price)}
          </div>
        </div>
      </div>

      <CardHeader className="gap-1.5 pb-3">
        <CardTitle className="text-sm font-semibold leading-tight">
          {billboard.reference ?? "Valla disponible"}
        </CardTitle>
        <div className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {[billboard.address, billboard.cityName, billboard.departmentName]
            .filter(Boolean)
            .join(", ") || "—"}
        </div>
      </CardHeader>

      <CardContent className="pb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Ruler
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                Medidas
              </div>
              <div className="truncate text-sm font-medium text-foreground">
                {formatSize(billboard.height, billboard.width)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between">
            <div></div>
            {mapsHref && (
              <Link
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex min-h-[44px] items-center justify-center rounded-md border border-border/70 bg-background/70 px-3 text-sm font-medium text-foreground shadow-xs transition-colors duration-200",
                  "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer bg-primary text-primary-foreground"
                )}
              >
                Mapa
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
