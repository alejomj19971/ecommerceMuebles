import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/catalog-products";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const categoryParam = url.searchParams.get("category")?.trim().toLowerCase() ?? null;

  const data = await getCatalogProducts({ q, category: categoryParam, take: 48 });
  return NextResponse.json(data);
}
