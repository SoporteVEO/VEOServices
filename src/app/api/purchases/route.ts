import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/db/prisma-service";
import { assertDigitalAvailability } from "@/server/digital-billboards/shop.service";
import { isDigitalSpotOption } from "@/lib/digital-spots";

type IncomingStatic = {
  kind?: "static";
  lineId?: string;
  billboardId: number;
  billboardCode: string | null;
  reference: string | null;
  departmentName: string | null;
  cityName: string | null;
  address: string | null;
  price: number;
  from: string;
  to: string;
};

type IncomingDigital = {
  kind: "digital";
  lineId?: string;
  digitalBillboardId: string;
  spotCount: number;
  billboardCode: string | null;
  reference: string | null;
  departmentName: string | null;
  cityName: string | null;
  address: string | null;
  price: number;
  from: string;
  to: string;
};

type IncomingItem = IncomingStatic | IncomingDigital;

function isDigitalItem(item: IncomingItem): item is IncomingDigital {
  return item.kind === "digital";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      paypalOrderId,
      items,
    }: {
      paypalOrderId: string;
      email: string;
      items: IncomingItem[];
    } = body;

    if (!paypalOrderId || !items?.length || !body.email) {
      return NextResponse.json(
        { error: "Missing order id, items, or email" },
        { status: 400 }
      );
    }

    const email = String(body.email).trim().toLowerCase();

    for (const item of items) {
      if (isDigitalItem(item)) {
        if (!item.digitalBillboardId || !isDigitalSpotOption(item.spotCount)) {
          return NextResponse.json(
            { error: "Item digital inválido" },
            { status: 400 }
          );
        }
        const check = await assertDigitalAvailability(
          item.digitalBillboardId,
          new Date(item.from),
          new Date(item.to),
          item.spotCount
        );
        if (!check.ok) {
          return NextResponse.json({ error: check.message }, { status: 409 });
        }
      } else {
        if (
          item.billboardId == null ||
          !Number.isFinite(Number(item.billboardId))
        ) {
          return NextResponse.json(
            { error: "Item estático inválido" },
            { status: 400 }
          );
        }
      }
    }

    const customer = await prisma.customer.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    const fromDates = items.map((i) => new Date(i.from));
    const toDates = items.map((i) => new Date(i.to));

    const existing = await prisma.purchase.findFirst({
      where: { paypalOrderId },
      include: { items: true },
    });

    const createRows = items.map((item) => {
      if (isDigitalItem(item)) {
        return {
          billboardId: null,
          digitalBillboardId: item.digitalBillboardId,
          spotCount: item.spotCount,
          billboardCode: item.billboardCode ?? undefined,
          reference: item.reference ?? undefined,
          departmentName: item.departmentName ?? undefined,
          cityName: item.cityName ?? undefined,
          address: item.address ?? undefined,
          price: item.price,
          from: new Date(item.from),
          to: new Date(item.to),
        };
      }
      return {
        billboardId: item.billboardId,
        digitalBillboardId: null,
        spotCount: null,
        billboardCode: item.billboardCode ?? undefined,
        reference: item.reference ?? undefined,
        departmentName: item.departmentName ?? undefined,
        cityName: item.cityName ?? undefined,
        address: item.address ?? undefined,
        price: item.price,
        from: new Date(item.from),
        to: new Date(item.to),
      };
    });

    const purchase = existing
      ? await prisma.purchase.update({
          where: { id: existing.id },
          data: {
            customerId: customer.id,
            items: {
              deleteMany: {},
              create: createRows,
            },
          },
          include: { items: true },
        })
      : await prisma.purchase.create({
          data: {
            status: "COMPLETED",
            paypalOrderId,
            customerId: customer.id,
            items: {
              create: createRows,
            },
          },
          include: { items: true },
        });

    revalidatePath("/search");

    return NextResponse.json(
      {
        id: purchase.id,
        paypalOrderId: purchase.paypalOrderId,
        itemCount: purchase.items.length,
        from: new Date(
          Math.min.apply(
            null,
            fromDates.map((d) => d.getTime())
          )
        ),
        to: new Date(
          Math.max.apply(
            null,
            toDates.map((d) => d.getTime())
          )
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save purchase:", error);
    return NextResponse.json(
      { error: "Failed to save purchase" },
      { status: 500 }
    );
  }
}
