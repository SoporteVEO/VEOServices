import { ContentLayout } from "@/components/admin-panel/content-layout";
import { DigitalBillboardSpotsCalendar } from "@/components/pages/digital-billboards/digital-billboard-spots-calendar";
import { getDigitalBillboardById } from "@/server/digital-billboards/digital-billboards.service";
import { getSession } from "@/server/session";
import { notFound, redirect } from "next/navigation";

export default async function DigitalBillboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const board = await getDigitalBillboardById(id);

  if (!board) {
    notFound();
  }

  return (
    <ContentLayout title="Vallas digitales">
      <DigitalBillboardSpotsCalendar
        billboardId={board.id}
        code={board.code}
        name={board.name}
        maxSpots={board.maxSpots}
      />
    </ContentLayout>
  );
}
