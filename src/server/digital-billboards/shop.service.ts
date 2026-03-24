import prisma from "@/db/prisma-service";
import type { AvailableDigitalBillboard } from "@/server/billboards/entities/available_digital_billboard";
import type { AvailableState } from "@/server/billboards/entities/available_billboard";
import {
  type DigitalSpotOption,
  isDigitalSpotOption,
} from "@/lib/digital-spots";

export type { DigitalSpotOption } from "@/lib/digital-spots";
export { DIGITAL_SPOT_OPTIONS, isDigitalSpotOption } from "@/lib/digital-spots";

async function loadUsedSpotsByBillboard(
  from: Date,
  to: Date
): Promise<Map<string, number>> {
  const [usageAgg, purchaseRows] = await Promise.all([
    prisma.digitalBillboardUsage.groupBy({
      by: ["digitalBillboardId"],
      where: {
        timestamp: { gte: from, lte: to },
      },
      _sum: { duration: true },
    }),
    prisma.purchaseItem.findMany({
      where: {
        digitalBillboardId: { not: null },
        spotCount: { not: null },
        purchase: { status: "COMPLETED" },
        AND: [{ from: { lte: to } }, { to: { gte: from } }],
      },
      select: { digitalBillboardId: true, spotCount: true },
    }),
  ]);

  const map = new Map<string, number>();
  for (const u of usageAgg) {
    const add = u._sum.duration ?? 0;
    map.set(u.digitalBillboardId, (map.get(u.digitalBillboardId) ?? 0) + add);
  }
  for (const p of purchaseRows) {
    if (!p.digitalBillboardId || p.spotCount == null) continue;
    map.set(
      p.digitalBillboardId,
      (map.get(p.digitalBillboardId) ?? 0) + p.spotCount
    );
  }
  return map;
}

function departmentWhere(departmentId: number | null) {
  if (departmentId == null) {
    return {};
  }
  return {
    OR: [{ departmentId }, { departmentId: null }],
  };
}

export async function listDigitalShopDepartments(): Promise<AvailableState[]> {
  const rows = await prisma.digitalBillboard.findMany({
    where: { departmentId: { not: null } },
    select: { departmentId: true, departmentName: true },
  });
  const seen = new Set<number>();
  const out: AvailableState[] = [];
  for (const r of rows) {
    if (r.departmentId == null || seen.has(r.departmentId)) continue;
    seen.add(r.departmentId);
    out.push({
      departmentId: r.departmentId,
      departmentName: r.departmentName ?? "",
      availableCount: 0,
    });
  }
  out.sort((a, b) =>
    a.departmentName.localeCompare(b.departmentName, "es", {
      sensitivity: "base",
    })
  );
  return out;
}

export async function getAvailableDigitalBillboardsForShop(
  departmentId: number | null,
  from: Date,
  to: Date,
  desiredSpots: DigitalSpotOption
): Promise<AvailableDigitalBillboard[]> {
  const usedMap = await loadUsedSpotsByBillboard(from, to);
  const rows = await prisma.digitalBillboard.findMany({
    where: {
      price: { gt: 0 },
      ...departmentWhere(departmentId),
    },
    include: { image: true },
    orderBy: { name: "asc" },
  });

  const out: AvailableDigitalBillboard[] = [];
  for (const row of rows) {
    const used = usedMap.get(row.id) ?? 0;
    const remaining = row.maxSpots - used;
    if (remaining < desiredSpots) continue;
    out.push({
      id: row.id,
      code: row.code,
      name: row.name,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      price: row.price,
      maxSpots: row.maxSpots,
      spotsUsed: used,
      spotsRemaining: remaining,
      imageUrl:
        row.image?.mediumUrl ??
        row.image?.completeUrl ??
        row.image?.thumbnailUrl ??
        null,
      departmentId: row.departmentId ?? null,
      departmentName: row.departmentName ?? null,
    });
  }
  return out;
}

export async function assertDigitalAvailability(
  digitalBillboardId: string,
  from: Date,
  to: Date,
  desiredSpots: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isDigitalSpotOption(desiredSpots)) {
    return { ok: false, message: "Cantidad de spots no válida" };
  }
  const board = await prisma.digitalBillboard.findUnique({
    where: { id: digitalBillboardId },
    select: { maxSpots: true },
  });
  if (!board) {
    return { ok: false, message: "Valla digital no encontrada" };
  }
  const usedMap = await loadUsedSpotsByBillboard(from, to);
  const used = usedMap.get(digitalBillboardId) ?? 0;
  const remaining = board.maxSpots - used;
  if (remaining < desiredSpots) {
    return { ok: false, message: "Ya no hay disponibilidad para esos spots" };
  }
  return { ok: true };
}

export async function getCachedDigitalShopDepartments() {
  "use cache";
  return listDigitalShopDepartments();
}

export async function getCachedAvailableDigitalBillboards(
  departmentId: number | null,
  from: Date,
  to: Date,
  desiredSpots: DigitalSpotOption
) {
  "use cache";
  return getAvailableDigitalBillboardsForShop(
    departmentId,
    from,
    to,
    desiredSpots
  );
}
