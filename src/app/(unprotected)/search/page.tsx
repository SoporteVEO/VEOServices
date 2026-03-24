import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  getCachedAvailableBillboardsByState,
  getCachedAvailableStates,
} from "@/server/billboards/billboards.service";
import {
  getCachedAvailableDigitalBillboards,
  getCachedDigitalShopDepartments,
} from "@/server/digital-billboards/shop.service";
import { SearchSection } from "@/components/pages/search/search-section";
import { parseYYYYMMDD, toYYYYMMDD } from "@/lib/utils";
import {
  isDigitalSpotOption,
  parseSpotsSearchParam,
} from "@/lib/digital-spots";

function startOfToday() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

type SearchParamsShape = {
  stateId?: string;
  from?: string;
  to?: string;
  tipo?: string;
  spots?: string;
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4] dark:opacity-[0.25]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--muted),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_40%,var(--accent),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_80%,var(--muted),transparent_50%)]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <main className="relative mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        <header className="mb-5 space-y-2">
          <h1
            className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Vallas disponibles
          </h1>
        </header>

        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-24 rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/5" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-16/10 rounded-xl border border-border/70 bg-card/80 shadow-sm shadow-black/5"
                  />
                ))}
              </div>
            </div>
          }
        >
          <SearchContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function SearchContent({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const {
    stateId,
    from: fromParam,
    to: toParam,
    tipo: tipoParam,
    spots: spotsParam,
  } = await searchParams;

  let from = startOfToday();
  let to = addDays(from, 30);
  const fromParsed = parseYYYYMMDD(fromParam);
  const toParsed = parseYYYYMMDD(toParam);
  if (fromParsed && toParsed && fromParsed.getTime() < toParsed.getTime()) {
    from = fromParsed;
    to = toParsed;
  }

  const fromStr = toYYYYMMDD(from);
  const toStr = toYYYYMMDD(to);

  const mode = tipoParam === "digital" ? "digital" : "estatica";
  const digitalSpots = parseSpotsSearchParam(spotsParam);

  const staticStates =
    mode === "estatica" ? await getCachedAvailableStates(from, to) : [];
  const digitalDepartments =
    mode === "digital" ? await getCachedDigitalShopDepartments() : [];

  const states = mode === "estatica" ? staticStates : digitalDepartments;
  const showStateFilter = states.length > 0;

  const parsed = stateId ? Number(stateId) : NaN;
  const selectedDepartamentoId = Number.isFinite(parsed) ? parsed : null;

  let effectiveDepartamentoId: number | null = null;
  if (mode === "estatica") {
    const fallbackDepartamentoId = staticStates[0]?.departmentId ?? null;
    effectiveDepartamentoId = selectedDepartamentoId ?? fallbackDepartamentoId;
  } else if (digitalDepartments.length > 0) {
    const fallback = digitalDepartments[0]!.departmentId;
    const inList =
      selectedDepartamentoId != null &&
      digitalDepartments.some((d) => d.departmentId === selectedDepartamentoId);
    effectiveDepartamentoId = inList ? selectedDepartamentoId : fallback;
  } else {
    effectiveDepartamentoId = null;
  }

  const params = new URLSearchParams();
  params.set("from", fromStr);
  params.set("to", toStr);
  if (mode === "digital") {
    params.set("tipo", "digital");
    params.set("spots", String(digitalSpots));
  }
  if (showStateFilter && effectiveDepartamentoId != null) {
    params.set("stateId", String(effectiveDepartamentoId));
  }
  const canonical = `/search?${params.toString()}`;

  if (
    (fromParam !== fromStr || toParam !== toStr) &&
    (fromParam != null || toParam != null)
  ) {
    redirect(canonical);
  }

  if (mode === "estatica") {
    if (tipoParam === "digital" || spotsParam != null) {
      redirect(canonical);
    }
  } else {
    const rawSpots = spotsParam ?? "";
    if (
      rawSpots === "" ||
      !isDigitalSpotOption(Number(rawSpots)) ||
      Number(rawSpots) !== digitalSpots
    ) {
      redirect(canonical);
    }
    if (digitalDepartments.length === 0 && stateId != null) {
      redirect(canonical);
    }
  }

  if (
    showStateFilter &&
    (selectedDepartamentoId == null ||
      effectiveDepartamentoId !== selectedDepartamentoId) &&
    effectiveDepartamentoId != null
  ) {
    redirect(canonical);
  }

  const staticBillboards =
    mode === "estatica" && effectiveDepartamentoId != null
      ? await getCachedAvailableBillboardsByState(
          effectiveDepartamentoId,
          from,
          to
        )
      : [];

  const digitalBillboards =
    mode === "digital"
      ? await getCachedAvailableDigitalBillboards(
          effectiveDepartamentoId,
          from,
          to,
          digitalSpots
        )
      : [];

  return (
    <SearchSection
      mode={mode}
      states={states}
      showStateFilter={showStateFilter}
      selectedDepartmentId={effectiveDepartamentoId}
      staticBillboards={staticBillboards}
      digitalBillboards={digitalBillboards}
      digitalSpots={digitalSpots}
      from={fromStr}
      to={toStr}
    />
  );
}
