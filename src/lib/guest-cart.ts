export const GUEST_CART_KEY = "guest_cart_items_v2";

/** Disparado en la misma pestaña tras `writeGuestCart` (storage solo cruza pestañas). */
export const GUEST_CART_CHANGED_EVENT = "guest-cart-changed";

export type GuestCartItem = {
  slug: string;
  name: string;
  price: string;
  image: string;
  category: string;
  quantity: number;
};

export function readGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is GuestCartItem =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as GuestCartItem).slug === "string" &&
        typeof (row as GuestCartItem).quantity === "number"
    );
  } catch {
    return [];
  }
}

export function writeGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(GUEST_CART_CHANGED_EVENT));
}

export function upsertGuestCartItem(item: GuestCartItem) {
  const current = readGuestCart();
  const idx = current.findIndex((i) => i.slug === item.slug);
  if (idx >= 0) {
    const next = [...current];
    next[idx] = { ...next[idx], quantity: item.quantity };
    writeGuestCart(next);
    return next;
  }
  writeGuestCart([...current, item]);
  return [...current, item];
}
