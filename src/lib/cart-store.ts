import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLineStatic = {
  lineId: string;
  kind: "static";
  billboardId: number;
  billboardCode: string | null;
  reference: string | null;
  departmentName: string | null;
  cityName: string | null;
  address: string | null;
  price: number;
  imageUrl: string | null;
  from: string;
  to: string;
};

export type CartLineDigital = {
  lineId: string;
  kind: "digital";
  digitalBillboardId: string;
  spotCount: number;
  billboardCode: string | null;
  reference: string | null;
  departmentName: string | null;
  cityName: string | null;
  address: string | null;
  price: number;
  imageUrl: string | null;
  from: string;
  to: string;
};

export type CartItem = CartLineStatic | CartLineDigital;

type CartState = {
  items: CartItem[];
  addItem: (
    item: Omit<CartLineStatic, "lineId"> | Omit<CartLineDigital, "lineId">
  ) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
};

function newLineId() {
  return globalThis.crypto.randomUUID();
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const lineId = newLineId();
        const full =
          item.kind === "digital"
            ? ({ ...item, lineId } satisfies CartLineDigital)
            : ({ ...item, lineId } satisfies CartLineStatic);
        const items = get().items;
        const exists = items.some((i) => {
          if (full.kind === "static" && i.kind === "static") {
            return (
              i.billboardId === full.billboardId &&
              i.from === full.from &&
              i.to === full.to
            );
          }
          if (full.kind === "digital" && i.kind === "digital") {
            return (
              i.digitalBillboardId === full.digitalBillboardId &&
              i.from === full.from &&
              i.to === full.to &&
              i.spotCount === full.spotCount
            );
          }
          return false;
        });
        if (exists) return;
        set({ items: [...items, full] });
      },
      removeLine: (lineId) => {
        set({
          items: get().items.filter((i) => i.lineId !== lineId),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "billboards-cart-v2",
    }
  )
);
