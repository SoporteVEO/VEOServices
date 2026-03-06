import type { AvailableBillboard } from "@/server/billboards/entities/available_billboard";
import { BillboardCard } from "@/components/pages/search/billboard-card";

interface BillboardsGridProps {
  billboards: AvailableBillboard[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export function BillboardsGrid({
  billboards,
  isLoading,
  skeletonCount,
}: BillboardsGridProps) {
  if (isLoading) {
    const baseCount = (skeletonCount ?? billboards.length) || 3;
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {billboards.map((b) => (
        <BillboardCard key={b.billboardId} billboard={b} />
      ))}
    </div>
  );
}
