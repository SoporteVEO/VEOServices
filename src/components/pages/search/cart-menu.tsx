"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Package } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    currencyDisplay: "code",
  }).format(value);
}

export function CartMenu() {
  const router = useRouter();
  const { items, removeItem } = useCartStore();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const count = items.length;
  const total = React.useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );

  const toggle = () => {
    if (count === 0) {
      router.push("/cart");
      return;
    }
    setOpen((prev) => !prev);
  };

  const goToCheckout = () => {
    setOpen(false);
    router.push("/cart");
  };

  if (!count && !open) {
    // Still show a subtle button so users discover the cart
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => router.push("/cart")}
        className="gap-1.5"
      >
        <ShoppingCart className="h-4 w-4" aria-hidden />
        <span className="text-xs">Carrito</span>
      </Button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={toggle}
        className={cn("gap-1.5", open && "bg-accent/60 text-accent-foreground")}
      >
        <ShoppingCart className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium">Carrito</span>
        {count > 0 && (
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-primary-foreground">
            {count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 sm:w-80">
          <Card className="border-border/70 bg-background/95 shadow-lg shadow-black/20 backdrop-blur-md">
            <div className="max-h-64 overflow-auto py-2">
              {items.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Tu carrito está vacío.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.billboardId}-${item.from}-${item.to}`}
                    className="flex items-start gap-2 px-3 py-2 text-xs"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-5 w-5" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">
                        {item.billboardCode ?? `Valla ${item.billboardId}`}
                      </div>
                      <div className="truncate text-muted-foreground">
                        {item.cityName}, {item.departmentName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.from} – {item.to}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.billboardId)}
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Quitar de carrito"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden />
                    </button>
                  </div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="space-y-1 border-t border-border/60 px-3 py-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatMoney(total)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
              <button
                type="button"
                onClick={goToCheckout}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Ir a pagar
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
