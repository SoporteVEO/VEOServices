"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UsersTable } from "./users-table";
import { User } from "@/generated/prisma/browser";

interface UsersClientProps {
  initialData: {
    data: User[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

export function UsersClient({ initialData }: UsersClientProps) {
  const router = useRouter();
  const [data, setData] = React.useState(initialData);

  const handleRefresh = React.useCallback(async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";

    try {
      const response = await fetch(
        `/api/users?page=${page}&pageSize=${pageSize}`
      );
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
      }
    } catch (error) {
      console.error("Error refreshing users:", error);
    }

    router.refresh();
  }, [router]);

  return (
    <UsersTable
      users={data.data}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      pageCount={data.pageCount}
      onRefresh={handleRefresh}
    />
  );
}
