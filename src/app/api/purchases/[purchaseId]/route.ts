import { NextResponse } from "next/server";
import prisma from "@/db/prisma-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ purchaseId: string }> }
) {
  try {
    const { purchaseId } = await context.params;
    if (!purchaseId) {
      return NextResponse.json(
        { error: "Missing purchase id" },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: purchase.id,
      status: purchase.status,
      paypalOrderId: purchase.paypalOrderId,
      createdAt: purchase.createdAt,
      items: purchase.items.map((item) => ({
        id: item.id,
        billboardId: item.billboardId,
        billboardCode: item.billboardCode,
        reference: item.reference,
        departmentName: item.departmentName,
        cityName: item.cityName,
        address: item.address,
        price: item.price,
        from: item.from,
        to: item.to,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch purchase:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}
