import { queryBriloDatabase } from "@/db/sql_server";
import fs from "fs";
import type {
  AvailableBillboard,
  AvailableState,
} from "@/server/billboards/entities/available_billboard";

function detectImageMimeType(buf: Buffer): string | null {
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (buf.length >= 6) {
    const header = buf.toString("ascii", 0, 6);
    if (header === "GIF87a" || header === "GIF89a") return "image/gif";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function toDataUrl(image: unknown): string | null {
  if (!image) return null;
  const buf = Buffer.isBuffer(image) ? image : Buffer.from(image as any);
  if (!buf.length) return null;
  const mime = detectImageMimeType(buf);
  if (!mime) return null;
  return `data:${mime};base64,${buf.toString("base64")}`;
}

class BillboardsService {
  private getAvailableStatesQuery = fs.readFileSync(
    "./src/server/billboards/get-available-states.sql",
    "utf8"
  );

  private getAvailableBillboardsByStateQuery = fs.readFileSync(
    "./src/server/billboards/get-available-billboards-by-state.sql",
    "utf8"
  );

  async getAvailableStates(fechaInicio: Date, fechaFin: Date) {
    const rows = (await queryBriloDatabase(this.getAvailableStatesQuery, {
      FechaInicio: fechaInicio,
      FechaFin: fechaFin,
    })) as any[];

    return rows.map((r) => {
      return {
        departmentId: Number(r.departamentoId),
        departmentName: String(r.departamento ?? ""),
        availableCount: Number(r.availableCount ?? 0),
      } satisfies AvailableState;
    });
  }

  async getAvailableBillboardsByState(
    departmentId: number,
    fechaInicio: Date,
    fechaFin: Date
  ) {
    const rows = (await queryBriloDatabase(
      this.getAvailableBillboardsByStateQuery,
      {
        DepartamentoId: departmentId,
        FechaInicio: fechaInicio,
        FechaFin: fechaFin,
      }
    )) as any[];

    const filtered = rows.filter((r) => {
      if (r.Precio == null) return false;
      const numeric = Number(r.Precio);
      if (!Number.isFinite(numeric)) return false;
      return numeric > 0;
    });

    return filtered.map((r) => {
      return {
        billboardId: Number(r.caraId),
        billboardCode: r.caraCodigo ?? null,

        reference: r.Referencia ?? null,
        address: r["Dirección"] ?? null,

        departmentId: r.DepartamentoId ?? null,
        departmentName: r.Departamento ?? null,
        cityName: r.Municipio ?? null,
        streetName: r.Calle ?? null,

        height: r.Alto ?? null,
        width: r.Ancho ?? null,

        latitude: r.Latitud ?? null,
        longitude: r.Longitud ?? null,

        price: r.Precio ?? null,

        imageId: r.ImagenId ?? null,
        imageUrl: toDataUrl(r.Imagen),
        imageDate: r.ImagenFecha ?? null,
        imageNotes: r.ImagenObservaciones ?? null,
      } satisfies AvailableBillboard;
    });
  }
}

export const billboardsService = new BillboardsService();

export async function getCachedAvailableStates(from: Date, to: Date) {
  "use cache";
  return await billboardsService.getAvailableStates(from, to);
}

export async function getCachedAvailableBillboardsByState(
  departmentId: number,
  from: Date,
  to: Date
) {
  "use cache";
  return await billboardsService.getAvailableBillboardsByState(
    departmentId,
    from,
    to
  );
}
