import { NextResponse } from "next/server";
import { getCatalogProductBySlug } from "@/lib/catalog-products";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
