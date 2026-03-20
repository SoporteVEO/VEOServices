import { ContentLayout } from "@/components/admin-panel/content-layout";
import { getSession } from "@/server/session";
import prisma from "@/db/prisma-service";
import {
  PurchasesTable,
  type PurchaseRow,
} from "@/components/pages/purchases/purchases-table";
import { redirect } from "next/navigation";

export default async function PurchasesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: true,
    },
  });

  const rows: PurchaseRow[] = purchases.map((p) => ({
    id: p.id,
    createdAt: p.createdAt.toISOString(),
    status: p.status,
    paypalOrderId: p.paypalOrderId,
    customerEmail: p.customer.email,
    customerName: p.customer.name,
    items: p.items.map((i) => ({
      id: i.id,
      billboardId: i.billboardId,
      billboardCode: i.billboardCode,
      reference: i.reference,
      departmentName: i.departmentName,
      cityName: i.cityName,
      address: i.address,
      price: i.price,
      from: i.from.toISOString(),
      to: i.to.toISOString(),
    })),
  }));

  return (
    <ContentLayout title="Compras">
      <PurchasesTable purchases={rows} />
    </ContentLayout>
  );
}
