import { ContentLayout } from "@/components/admin-panel/content-layout";
import { getSession } from "@/server/session";
import { redirect } from "next/navigation";
import { contractsService } from "@/server/contracts/contracts.service";
import { ContractsTabNav } from "@/components/pages/contracts/contracts-tab-nav";
import { ContractsTable } from "@/components/pages/contracts/contracts-table";

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

  const contracts = await contractsService.getEndingSoonContracts(
    new Date("2026-03-01"),
    new Date("2026-03-31")
  );

  return (
    <ContentLayout title="Contratos">
      <div className="space-y-6">
        <ContractsTabNav />
        {activeTab === "contratos-por-vencer" && (
          <ContractsTable contracts={contracts} />
        )}
        {activeTab === "notificaciones" && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Notificaciones</h2>
            <p className="text-muted-foreground">
              Contenido de notificaciones aquí.
            </p>
          </section>
        )}
      </div>
    </ContentLayout>
  );
}
