import { ContentLayout } from "@/components/admin-panel/content-layout";
import { getSession } from "@/server/session";
import { redirect } from "next/navigation";
import { UsersClient } from "@/components/pages/users/users-client";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = parseInt(params.pageSize || "10");
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count(),
  ]);

  return (
    <ContentLayout title="Usuarios">
      <UsersClient
        initialData={{
          data: users,
          total,
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
        }}
      />
    </ContentLayout>
  );
}
