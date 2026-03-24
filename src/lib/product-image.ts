/** Imagen por defecto del catálogo (misma URL que el placeholder histórico). */
export const PRODUCT_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80";

/** Usa la URL guardada en BD o el placeholder si viene vacía o no es http(s). */
export function productImageOrPlaceholder(url?: string | null): string {
  const u = url?.trim();
  if (
    u &&
    (u.startsWith("https://") || u.startsWith("http://")) &&
    u.length <= 2048
  ) {
    return u;
  }
  return PRODUCT_IMAGE_PLACEHOLDER;
}
