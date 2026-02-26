import { getSession } from "@/server/session";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";

async function RootRedirect(): Promise<ReactNode> {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }
  redirect("/dashboard");
  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RootRedirect />
    </Suspense>
  );
}
