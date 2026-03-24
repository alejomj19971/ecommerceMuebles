import { NextResponse } from "next/server";
import { getMe } from "@/lib/auth";

export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: me });
}

