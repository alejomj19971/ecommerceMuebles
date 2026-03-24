import type { Product } from "@/mocks/home-data";
import { featuredProducts } from "@/mocks/home-data";

export type CartItem = Product & {
  quantity: number;
};

export const cartItemsMock: CartItem[] = [
  {
    ...featuredProducts[0],
    quantity: 1,
  },
  {
    ...featuredProducts[4],
    quantity: 2,
  },
];

export const emptyCartItemsMock: CartItem[] = [];
