import type { NextRequest } from "next/server";
import { EndingSoonContractsWorker } from "@/server/worker/ending-soon-contracts";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const worker = new EndingSoonContractsWorker();
  await worker.execute();

  return new Response("Ending soon contracts worker executed");
}
