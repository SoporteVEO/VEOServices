export const DIGITAL_SPOT_OPTIONS = [300, 450, 900] as const;
export type DigitalSpotOption = (typeof DIGITAL_SPOT_OPTIONS)[number];

export function isDigitalSpotOption(n: number): n is DigitalSpotOption {
  return (DIGITAL_SPOT_OPTIONS as readonly number[]).includes(n);
}

export function parseSpotsSearchParam(
  raw: string | undefined
): DigitalSpotOption {
  const n = raw != null && raw !== "" ? Number(raw) : 300;
  if (isDigitalSpotOption(n)) return n;
  return 300;
}

export function computeDigitalLinePrice(
  price: number,
  maxSpots: number,
  spotCount: number
): number {
  if (!Number.isFinite(price) || !Number.isFinite(maxSpots) || maxSpots <= 0) {
    return price;
  }
  return Math.round((price / maxSpots) * spotCount * 100) / 100;
}
