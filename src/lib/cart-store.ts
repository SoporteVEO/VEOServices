import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
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

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (billboardId: number) => void;
  /** Remove a single line matching billboardId + from + to */
  removeItemExact: (billboardId: number, from: string, to: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const exists = items.some(
          (i) =>
            i.billboardId === item.billboardId &&
            i.from === item.from &&
            i.to === item.to
        );
        if (exists) return;
        set({ items: [...items, item] });
      },
      removeItem: (billboardId) => {
        set({
          items: get().items.filter((i) => i.billboardId !== billboardId),
        });
      },
      removeItemExact: (billboardId, from, to) => {
        set({
          items: get().items.filter(
            (i) =>
              !(i.billboardId === billboardId && i.from === from && i.to === to)
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "billboards-cart",
    }
  )
);
