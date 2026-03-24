import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import { CheckCircle2, Mail, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/db/prisma-service";
import { formatMoney, formatDateRange } from "@/lib/utils";

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ purchaseId?: string }>;
}) {
  unstable_noStore();

  const params = await searchParams;
  const { purchaseId } = params;

  if (!purchaseId?.trim()) {
    redirect("/search");
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId.trim() },
    include: {
      items: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!purchase) {
    redirect("/search");
  }

  const orderShortId = purchase.id.slice(-8).toUpperCase();
  const total = purchase.items.reduce((sum, i) => sum + (i.price ?? 0), 0);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4] dark:opacity-[0.25]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--muted),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_40%,var(--accent),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_80%,var(--muted),transparent_50%)]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <main className="relative mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-9" aria-hidden />
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            ¡Gracias por tu compra!
          </h1>
          <p className="mt-2 text-muted-foreground sm:text-lg">
            Tu orden ha sido recibida correctamente.
          </p>
          <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-4 py-4 text-center sm:flex-row sm:gap-3 sm:px-6">
            <Mail
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <p className="text-sm text-foreground sm:text-base">
              Revisa tu correo para más detalles y actualizaciones sobre tu
              reserva.
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Número de orden:{" "}
            <span className="font-mono font-medium text-foreground">
              #{orderShortId}
            </span>
          </p>
        </div>

        <Card className="mt-10 border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="size-4" aria-hidden />
              Resumen de tu orden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {purchase.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {item.digitalBillboardId
                        ? (item.billboardCode ?? "Valla digital")
                        : (item.billboardCode ?? `Valla ${item.billboardId}`)}
                    </p>
                    {item.digitalBillboardId && item.spotCount != null && (
                      <p className="text-sm text-muted-foreground">
                        Paquete: {item.spotCount} spots
                      </p>
                    )}
                    <p className="truncate text-sm text-muted-foreground">
                      {item.reference ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[item.cityName, item.departmentName]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateRange(item.from, item.to)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {formatMoney(item.price)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatMoney(total)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/search">
              Seguir buscando
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ purchaseId?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Cargando...
        </div>
      }
    >
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
