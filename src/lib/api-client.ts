import { headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers();
  const rawHost =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    h.get("host") ??
    process.env.VERCEL_URL ??
    null;

  if (!rawHost) {
    return "http://localhost:3000";
  }

  const host = rawHost.replace(/^https?:\/\//, "");
  const protocol =
    host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";

  return `${protocol}://${host}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = await getBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

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

