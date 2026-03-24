import { headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? null;
  // Dev normalmente corre en http://localhost:3000
  const protocol = host?.includes("localhost") ? "http" : "https";
  if (!host) return "";
  return `${protocol}://${host}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = await getBaseUrl();
  const url = base ? `${base}${path}` : path;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Error ${res.status} en ${path}`);
  }

  return (await res.json()) as T;
}

