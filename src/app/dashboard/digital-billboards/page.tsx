import { ContentLayout } from "@/components/admin-panel/content-layout";
import { DigitalBillboardsTable } from "@/components/pages/digital-billboards/digital-billboards-table";
import { getSession } from "@/server/session";
import { listDigitalBillboards } from "@/server/digital-billboards/digital-billboards.service";
import { redirect } from "next/navigation";

export default async function DigitalBillboardsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const rows = await listDigitalBillboards();
  const initialRows = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <ContentLayout title="Vallas digitales">
      <DigitalBillboardsTable initialRows={initialRows} />
    </ContentLayout>
  );
}
