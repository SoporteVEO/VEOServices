"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Loader2 } from "lucide-react";
import type { AvailableBillboard } from "@/server/billboards/entities/available_billboard";
import type { AvailableDigitalBillboard } from "@/server/billboards/entities/available_digital_billboard";
import type { AvailableState } from "@/server/billboards/entities/available_billboard";
import type { DigitalSpotOption } from "@/lib/digital-spots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StateSelect } from "@/components/pages/search/state-select";
import { DateRangeFilter } from "@/components/pages/search/date-range-filter";
import { BillboardsGrid } from "@/components/pages/search/billboards-grid";
import { formatDate } from "@/lib/utils";
import { revalidateSearchPath } from "@/app/(unprotected)/search/actions";
import { CartMenu } from "@/components/pages/search/cart-menu";
import { BillboardTipoSelect } from "@/components/pages/search/billboard-tipo-select";
import { DigitalSpotsFilter } from "@/components/pages/search/digital-spots-filter";

interface SearchSectionProps {
  mode: "estatica" | "digital";
  states: AvailableState[];
  showStateFilter: boolean;
  selectedDepartmentId: number | null;
  staticBillboards: AvailableBillboard[];
  digitalBillboards: AvailableDigitalBillboard[];
  digitalSpots: DigitalSpotOption;
  from: string;
  to: string;
}

export function SearchSection({
  mode,
  states,
  showStateFilter,
  selectedDepartmentId,
  staticBillboards,
  digitalBillboards,
  digitalSpots,
  from,
  to,
}: SearchSectionProps) {
  const [loadingDepartmentId, setLoadingDepartmentId] = React.useState<
    number | null
  >(null);
  const activeDepartmentId =
    loadingDepartmentId != null ? loadingDepartmentId : selectedDepartmentId;
  const selectedState = React.useMemo(
    () => states.find((s) => s.departmentId === activeDepartmentId) ?? null,
    [states, activeDepartmentId]
  );

  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const lastSearchRef = React.useRef(searchParams.toString());

  React.useEffect(() => {
    const current = searchParams.toString();
    if (current !== lastSearchRef.current) {
      lastSearchRef.current = current;
      setIsLoading(false);
      setLoadingDepartmentId(null);
    }
  }, [searchParams]);

  const handleDateRangeChange = React.useCallback(
    async (newFrom: string, newTo: string) => {
      if (selectedDepartmentId != null) {
        setLoadingDepartmentId(selectedDepartmentId);
      }
      const params = new URLSearchParams(searchParams?.toString());
      params.set("from", newFrom);
      params.set("to", newTo);
      setIsLoading(true);
      void revalidateSearchPath();
      router.push(`/search?${params.toString()}`);
    },
    [searchParams, router, selectedDepartmentId]
  );

  const handleStateStartLoading = React.useCallback((departmentId: number) => {
    setLoadingDepartmentId(departmentId);
    setIsLoading(true);
  }, []);

  const listLength =
    mode === "digital" ? digitalBillboards.length : staticBillboards.length;
  const noStaticRegions = mode === "estatica" && states.length === 0;
  const emptyCatalog =
    !noStaticRegions && listLength === 0 && loadingDepartmentId == null;

  return (
    <div className="space-y-6 md:grid md:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] md:items-start md:gap-6 md:space-y-0">
      <div className="md:sticky md:top-4 -mx-3 border-b border-border/60 px-3 py-3 sm:-mx-6 sm:px-6 md:mx-0 md:border-b-0 md:px-0 md:py-0">
        <Card className="border-border/70 bg-card/90 shadow-sm shadow-black/5">
          <CardHeader className="gap-1">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <span>Filtros</span>
              {isLoading && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  <span>Cargando…</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangeFilter
              from={from}
              to={to}
              onRangeChange={handleDateRangeChange}
              disabled={isLoading}
              isLoading={isLoading}
            />
            <BillboardTipoSelect value={mode} isLoading={isLoading} />
            {mode === "digital" && (
              <DigitalSpotsFilter value={digitalSpots} isLoading={isLoading} />
            )}
            {showStateFilter && (
              <StateSelect
                states={states}
                selectedDepartamentoId={selectedDepartmentId}
                onStartLoading={handleStateStartLoading}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {noStaticRegions ? (
          <Card className="border-border/70 bg-card/90">
            <CardContent className="py-10 text-center">
              <div className="mx-auto max-w-[55ch] space-y-2">
                <div className="text-base font-semibold text-foreground">
                  No billboards available
                </div>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  We did not find availability for the range {formatDate(from)}{" "}
                  – {formatDate(to)}.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : emptyCatalog ? (
          <Card className="border-border/70 bg-card/90">
            <CardContent className="py-10 text-center">
              <div className="mx-auto max-w-[55ch] space-y-2">
                <div className="text-base font-semibold text-foreground">
                  {mode === "digital"
                    ? "Sin vallas digitales disponibles"
                    : "No results in this state"}
                </div>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {mode === "digital"
                    ? `Ninguna valla cumple el cupo de ${digitalSpots} spots en el rango ${formatDate(from)} – ${formatDate(to)}. Prueba otro paquete de spots o otro departamento.`
                    : `Try a different state. The current range is ${formatDate(from)} – ${formatDate(to)}.`}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground tabular-nums">
                {listLength} encontradas
              </div>
              <CartMenu />
            </div>
            <BillboardsGrid
              mode={mode}
              staticBillboards={staticBillboards}
              digitalBillboards={digitalBillboards}
              digitalSpotFilter={digitalSpots}
              isLoading={isLoading}
              skeletonCount={selectedState?.availableCount ?? listLength}
              from={from}
              to={to}
            />
          </section>
        )}
      </div>
    </div>
  );
}
