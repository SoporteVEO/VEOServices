import { ContentLayout } from "@/components/admin-panel/content-layout";
import { getSession } from "@/server/session";
import { redirect } from "next/navigation";
import {
  getCachedEndingSoonContracts,
  getCachedNotifiedContracts,
} from "@/server/contracts/contracts.service";
import { ContractsTabNav } from "@/components/pages/contracts/contracts-tab-nav";
import { ContractsTable } from "@/components/pages/contracts/contracts-table";
import { NotifiedContractsTable } from "@/components/pages/contracts/notified-contracts-table";

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const { tab } = await searchParams;
  const activeTab = tab ?? "contratos-por-vencer";

  const [contracts, notifiedContracts] = await Promise.all([
    getCachedEndingSoonContracts(
      new Date("2026-02-24"),
      new Date("2026-03-25")
    ),
    getCachedNotifiedContracts(),
  ]);

  return (
    <ContentLayout title="Contratos">
      <div className="space-y-6">
        <ContractsTabNav />
        {activeTab === "contratos-por-vencer" && (
          <ContractsTable contracts={contracts} />
        )}
        {activeTab === "notificaciones" && (
          <NotifiedContractsTable contracts={notifiedContracts} />
        )}
      </div>
    </ContentLayout>
  );
}
