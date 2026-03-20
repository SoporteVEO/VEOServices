import { auth } from "@/lib/auth";
import {
  createDigitalBillboardUsage,
  listDigitalBillboardUsagesInRange,
} from "@/server/digital-billboards/digital-billboards.service";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// GET /api/digital-billboards/[id]/spots?from=ISO&to=ISO
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const fromRaw = request.nextUrl.searchParams.get("from");
    const toRaw = request.nextUrl.searchParams.get("to");

    if (!fromRaw || !toRaw) {
      return NextResponse.json(
        { error: "Se requieren los parámetros from y to (ISO 8601)" },
        { status: 400 }
      );
    }

    const from = new Date(fromRaw);
    const to = new Date(toRaw);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return NextResponse.json(
        { error: "from o to no son fechas válidas" },
        { status: 400 }
      );
    }

    const usages = await listDigitalBillboardUsagesInRange(id, from, to);

    return NextResponse.json({
      data: usages.map((u) => ({
        id: u.id,
        timestamp: u.timestamp.toISOString(),
        duration: u.duration,
        campaignName: u.campaignName,
        campaignDescription: u.campaignDescription,
      })),
    });
  } catch (e) {
    console.error("[GET /api/digital-billboards/[id]/spots]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

// POST /api/digital-billboards/[id]/spots
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as {
      timestamp?: string;
      duration?: number;
      campaignName?: string | null;
      campaignDescription?: string | null;
    };

    const timestamp = body.timestamp ? new Date(body.timestamp) : null;
    if (!timestamp || Number.isNaN(timestamp.getTime())) {
      return NextResponse.json(
        { error: "timestamp es obligatorio y debe ser una fecha válida" },
        { status: 400 }
      );
    }

    const duration = Number(body.duration);
    if (!Number.isFinite(duration)) {
      return NextResponse.json({ error: "duration es obligatorio" }, { status: 400 });
    }

    const created = await createDigitalBillboardUsage({
      digitalBillboardId: id,
      timestamp,
      duration,
      campaignName: body.campaignName,
      campaignDescription: body.campaignDescription,
    });

    revalidatePath("/dashboard/digital-billboards");
    revalidatePath(`/dashboard/digital-billboards/${id}`);

    return NextResponse.json({
      data: {
        id: created.id,
        timestamp: created.timestamp.toISOString(),
        duration: created.duration,
        campaignName: created.campaignName,
        campaignDescription: created.campaignDescription,
      },
    });
  } catch (e) {
    console.error("[POST /api/digital-billboards/[id]/spots]", e);
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
