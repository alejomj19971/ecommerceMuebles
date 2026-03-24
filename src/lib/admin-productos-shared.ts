export function normalizeImagenUrl(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw !== "string") return null;
  const u = raw.trim();
  if (!u) return null;
  if (u.length > 2048) return null;
  if (!u.startsWith("https://") && !u.startsWith("http://")) return null;
  return u;
}
