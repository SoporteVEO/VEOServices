import { ContentLayout } from "@/components/admin-panel/content-layout";
import { getSession } from "@/server/session";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <ContentLayout title={`Bienvenido ${session?.user?.firstName}!`}>
      <h1>Dashboard</h1>
    </ContentLayout>
  );
}
