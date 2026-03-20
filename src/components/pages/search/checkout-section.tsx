"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  Trash2,
  ShoppingBag,
  Package,
  Shield,
  CreditCard,
  Store,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { formatMoney } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function CheckoutSection() {
  const router = useRouter();
  const { items, removeItemExact } = useCartStore();
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal;

  const emailIsValid = email.trim().length > 3 && email.includes("@");

  const handleRemove = (item: CartItem) => {
    const key = `${item.billboardId}-${item.from}-${item.to}`;
    setRemovingKey(key);
    setTimeout(() => {
      removeItemExact(item.billboardId, item.from, item.to);
      setRemovingKey(null);
    }, 300);
  };

  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
    currency: "USD",
    components: "buttons",
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tu carrito
        </h1>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6 lg:sticky lg:top-4 lg:self-start">
          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="text-muted-foreground/50 mb-4 size-12" />
                <h3 className="text-lg font-medium">Tu carrito está vacío</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Añade vallas desde la búsqueda para continuar
                </p>
                <Button
                  className="mt-4 cursor-pointer"
                  variant="outline"
                  onClick={() => router.push("/search")}
                >
                  Seguir buscando
                </Button>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => {
              const key = `${item.billboardId}-${item.from}-${item.to}`;
              return (
                <Card
                  key={key}
                  className={cn("gap-0 overflow-hidden py-0", {
                    "opacity-50": removingKey === key,
                  })}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-auto w-full sm:w-40 shrink-0 bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.reference ?? item.billboardCode ?? "Valla"}
                          className="h-36 w-full object-cover object-center"
                        />
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center text-muted-foreground">
                          <Package className="size-10" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-foreground text-lg font-medium">
                            {item.billboardCode ?? `Valla ${item.billboardId}`}
                          </h3>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {item.reference ?? "—"}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {[item.cityName, item.departmentName]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8 cursor-pointer"
                          onClick={() => handleRemove(item)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <p className="text-lg font-semibold">
                          {formatMoney(item.price)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <CardFooter className="bg-muted/20 px-4 py-2!">
                    <div className="text-muted-foreground flex items-center text-sm">
                      <Package className="me-2 size-4" />
                      <span>
                        Período reservado: {item.from} a {item.to}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        <div className="w-full space-y-4 lg:w-96">
          <Card className="gap-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between text-base font-medium">
                <span>Total</span>
                <div className="text-end">
                  <p className="text-xl font-bold">{formatMoney(total)}</p>
                  <p className="text-muted-foreground text-xs">
                    IVA no incluido si aplica
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="space-y-1 text-left">
                  <label
                    htmlFor="checkout-email"
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    Correo de contacto
                  </label>
                  <Input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={email.length > 0 && !emailIsValid}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Te enviaremos la confirmación y actualizaciones de esta
                    reserva a este correo.
                  </p>
                </div>
                <PayPalScriptProvider options={paypalOptions}>
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={async () => {
                      try {
                        if (!emailIsValid) {
                          setMessage(
                            "Por favor ingresa un correo electrónico válido para continuar."
                          );
                          throw new Error("Email requerido");
                        }
                        setIsProcessing(true);
                        setMessage(null);
                        const response = await fetch("/api/paypal/orders", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ cart: items }),
                        });
                        const data = await response.json();
                        if (!response.ok || !data.id) {
                          throw new Error(
                            data.error || "No se pudo crear la orden"
                          );
                        }
                        return data.id;
                      } catch (err: unknown) {
                        setIsProcessing(false);
                        setMessage(
                          `No se pudo iniciar el pago: ${err instanceof Error ? err.message : String(err)}`
                        );
                        throw err;
                      }
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const orderId = data.orderID;
                        const captureRes = await fetch(
                          `/api/paypal/orders/${orderId}/capture`,
                          { method: "POST" }
                        );
                        const captureData = await captureRes.json();
                        if (!captureRes.ok) {
                          throw new Error(
                            captureData.error || "No se pudo capturar el pago"
                          );
                        }
                        const purchaseRes = await fetch("/api/purchases", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            paypalOrderId: orderId,
                            email,
                            items,
                          }),
                        });
                        const purchaseData = await purchaseRes.json();
                        useCartStore.getState().clear();
                        setIsProcessing(false);
                        setMessage(
                          "Pago completado correctamente. Gracias por tu compra."
                        );
                        if (purchaseData?.id) {
                          router.push(
                            `/search/success?purchaseId=${encodeURIComponent(purchaseData.id)}`
                          );
                        } else {
                          router.push("/search");
                        }
                      } catch (err: unknown) {
                        setIsProcessing(false);
                        setMessage(
                          `Hubo un problema al procesar el pago: ${err instanceof Error ? err.message : String(err)}`
                        );
                        if (actions?.restart) actions.restart();
                      }
                    }}
                    onCancel={() => {
                      setIsProcessing(false);
                      setMessage("Pago cancelado.");
                    }}
                    onError={(err) => {
                      setIsProcessing(false);
                      setMessage(
                        `Error de PayPal: ${err instanceof Error ? err.message : String(err)}`
                      );
                    }}
                    disabled={items.length === 0 || !emailIsValid}
                  />
                </PayPalScriptProvider>
              </div>
              {message && (
                <p className="text-center text-xs text-muted-foreground">
                  {message}
                </p>
              )}

              <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                <CreditCard className="size-3.5" />
                <span>Pago seguro con cifrado SSL</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-muted-foreground/70 py-4">
            <CardContent className="px-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h4 className="font-medium">Checkout seguro</h4>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Tu información de pago está cifrada y protegida.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="default"
            className="w-full cursor-pointer"
            onClick={() => router.push("/search")}
          >
            <Store className="me-2 size-4" />
            Seguir buscando
            <MoveRight className="ms-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
