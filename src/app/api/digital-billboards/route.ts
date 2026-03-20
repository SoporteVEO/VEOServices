import { auth } from "@/lib/auth";
import {
  createDigitalBillboard,
  listDigitalBillboards,
} from "@/server/digital-billboards/digital-billboards.service";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// GET /api/digital-billboards
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await listDigitalBillboards();
    return NextResponse.json({
      data: items.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("[GET /api/digital-billboards]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

// POST /api/digital-billboards — multipart: code, name, address, latitude, longitude, price, image? (file)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();

    const code = String(form.get("code") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    const latitude = Number(form.get("latitude"));
    const longitude = Number(form.get("longitude"));
    const price = Number(form.get("price"));
    const imageFile = form.get("image");

    if (!code || !name || !address) {
      return NextResponse.json(
        { error: "code, name y address son obligatorios" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { error: "latitude y longitude deben ser números válidos" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "price debe ser un número válido" },
        { status: 400 }
      );
    }

    let imageBase64: string | null = null;
    if (imageFile instanceof File && imageFile.size > 0) {
      const buf = Buffer.from(await imageFile.arrayBuffer());
      imageBase64 = buf.toString("base64");
    }

    const created = await createDigitalBillboard({
      code,
      name,
      address,
      latitude,
      longitude,
      price,
      imageBase64,
    });

    revalidatePath("/dashboard/digital-billboards");

    return NextResponse.json({
      data: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[POST /api/digital-billboards]", e);
    const message = e instanceof Error ? e.message : "Internal error";
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe una valla con ese código" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
