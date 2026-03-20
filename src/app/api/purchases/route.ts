import { NextResponse } from "next/server";
import prisma from "@/db/prisma-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      paypalOrderId,
      items,
    }: {
      paypalOrderId: string;
      email: string;
      items: Array<{
        billboardId: number;
        billboardCode: string | null;
        reference: string | null;
        departmentName: string | null;
        cityName: string | null;
        address: string | null;
        price: number;
        from: string;
        to: string;
      }>;
    } = body;

    if (!paypalOrderId || !items?.length || !body.email) {
      return NextResponse.json(
        { error: "Missing order id, items, or email" },
        { status: 400 }
      );
    }

    const email = String(body.email).trim().toLowerCase();

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

    const purchase = existing
      ? await prisma.purchase.update({
          where: { id: existing.id },
          data: {
            customerId: customer.id,
            items: {
              deleteMany: {},
              create: items.map((item) => ({
                billboardId: item.billboardId,
                billboardCode: item.billboardCode ?? undefined,
                reference: item.reference ?? undefined,
                departmentName: item.departmentName ?? undefined,
                cityName: item.cityName ?? undefined,
                address: item.address ?? undefined,
                price: item.price,
                from: new Date(item.from),
                to: new Date(item.to),
              })),
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
              create: items.map((item) => ({
                billboardId: item.billboardId,
                billboardCode: item.billboardCode ?? undefined,
                reference: item.reference ?? undefined,
                departmentName: item.departmentName ?? undefined,
                cityName: item.cityName ?? undefined,
                address: item.address ?? undefined,
                price: item.price,
                from: new Date(item.from),
                to: new Date(item.to),
              })),
            },
          },
          include: { items: true },
        });

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
