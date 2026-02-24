import { getSession } from "@/server/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  } else {
    redirect("/dashboard");
  }
}
