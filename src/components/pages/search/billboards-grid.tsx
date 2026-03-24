import type { AvailableBillboard } from "@/server/billboards/entities/available_billboard";
import type { AvailableDigitalBillboard } from "@/server/billboards/entities/available_digital_billboard";
import type { DigitalSpotOption } from "@/lib/digital-spots";
import { BillboardCard } from "@/components/pages/search/billboard-card";
import { DigitalBillboardCard } from "@/components/pages/search/digital-billboard-card";

interface BillboardsGridProps {
  mode: "estatica" | "digital";
  staticBillboards: AvailableBillboard[];
  digitalBillboards: AvailableDigitalBillboard[];
  digitalSpotFilter: DigitalSpotOption;
  isLoading?: boolean;
  skeletonCount?: number;
  from: string;
  to: string;
}

export function BillboardsGrid({
  mode,
  staticBillboards,
  digitalBillboards,
  digitalSpotFilter,
  isLoading,
  skeletonCount,
  from,
  to,
}: BillboardsGridProps) {
  if (isLoading) {
    const baseCount =
      (skeletonCount ??
        (mode === "digital"
          ? digitalBillboards.length
          : staticBillboards.length)) || 3;
    const count = Math.max(1, Math.min(12, baseCount));
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="h-full min-h-[220px] rounded-xl bg-primary/20 shadow-sm shadow-primary/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (mode === "digital") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {digitalBillboards.map((b) => (
          <DigitalBillboardCard
            key={b.id}
            billboard={b}
            from={from}
            to={to}
            defaultSpotCount={digitalSpotFilter}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {staticBillboards.map((b) => (
        <BillboardCard key={b.billboardId} billboard={b} from={from} to={to} />
      ))}
    </div>
  );
}
