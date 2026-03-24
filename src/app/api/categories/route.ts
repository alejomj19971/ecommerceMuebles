import { NextResponse } from "next/server";
import {
  CATEGORIA_LABELS,
  CATEGORIA_SLUGS,
} from "@/lib/utils";

export async function GET() {
  const categories = CATEGORIA_SLUGS.filter((s) => s !== "general").map(
    (slug) => ({
      slug,
      name: CATEGORIA_LABELS[slug],
    })
  );
  return NextResponse.json({ categories });
}
