import prisma from "@/db/prisma-service";
import { uploadToImgbb } from "@/server/digital-billboards/imgbb";

export type DigitalBillboardListItem = {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  imageThumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  maxSpots: number;
};

export async function listDigitalBillboards(): Promise<
  DigitalBillboardListItem[]
> {
  const rows = await prisma.digitalBillboard.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      image: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    price: row.price,
    imageThumbnailUrl:
      row.image?.thumbnailUrl ?? row.image?.completeUrl ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    maxSpots: row.maxSpots,
  }));
}

export type CreateDigitalBillboardInput = {
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  /** Raw base64 string (no data: prefix) when an image is provided */
  imageBase64?: string | null;
};

export async function createDigitalBillboard(
  input: CreateDigitalBillboardInput
): Promise<DigitalBillboardListItem> {
  const { code, name, address, latitude, longitude, price, imageBase64 } =
    input;

  let imageId: string | undefined;

  if (imageBase64 && imageBase64.length > 0) {
    const urls = await uploadToImgbb(imageBase64);
    const image = await prisma.image.create({
      data: {
        completeUrl: urls.completeUrl,
        thumbnailUrl: urls.thumbnailUrl,
        mediumUrl: urls.mediumUrl,
        deleteUrl: urls.deleteUrl,
      },
    });
    imageId = image.id;
  }

  try {
    const row = await prisma.digitalBillboard.create({
      data: {
        code,
        name,
        address,
        latitude,
        longitude,
        price,
        ...(imageId ? { imageId } : {}),
      },
      include: { image: true },
    });

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      price: row.price,
      imageThumbnailUrl:
        row.image?.thumbnailUrl ?? row.image?.completeUrl ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      maxSpots: row.maxSpots,
    };
  } catch (e) {
    if (imageId) {
      await prisma.image
        .delete({ where: { id: imageId } })
        .catch(() => undefined);
    }
    throw e;
  }
}

export async function getDigitalBillboardById(id: string) {
  return prisma.digitalBillboard.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });
}

/** Usages whose timestamp falls in [from, to] (inclusive bounds for query). */
export async function listDigitalBillboardUsagesInRange(
  digitalBillboardId: string,
  from: Date,
  to: Date
) {
  return prisma.digitalBillboardUsage.findMany({
    where: {
      digitalBillboardId,
      timestamp: {
        gte: from,
        lte: to,
      },
    },
    orderBy: { timestamp: "asc" },
    select: {
      id: true,
      timestamp: true,
      duration: true,
      campaignName: true,
      campaignDescription: true,
    },
  });
}

export type CreateUsageInput = {
  digitalBillboardId: string;
  timestamp: Date;
  duration: number;
  campaignName?: string | null;
  campaignDescription?: string | null;
};

export async function createDigitalBillboardUsage(input: CreateUsageInput) {
  const {
    digitalBillboardId,
    timestamp,
    duration,
    campaignName,
    campaignDescription,
  } = input;

  const d = Math.floor(duration);
  if (!Number.isFinite(duration) || d <= 0) {
    throw new Error("duration debe ser un entero positivo");
  }

  const board = await prisma.digitalBillboard.findUnique({
    where: { id: digitalBillboardId },
    select: { maxSpots: true },
  });
  if (!board) {
    throw new Error("Valla no encontrada");
  }
  if (d > board.maxSpots) {
    throw new Error(`duration no puede superar maxSpots (${board.maxSpots})`);
  }

  return prisma.digitalBillboardUsage.create({
    data: {
      digitalBillboardId,
      timestamp,
      duration: d,
      campaignName: campaignName ?? undefined,
      campaignDescription: campaignDescription ?? undefined,
    },
  });
}
