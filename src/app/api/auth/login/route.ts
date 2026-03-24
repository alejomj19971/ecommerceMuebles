import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createAuthToken,
  mapNombreRolToAuth,
  setAuthCookieOnResponse,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Credenciales incompletas" }, { status: 400 });
  }

  const user = await prisma.usuario.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      nombre: true,
      password: true,
      rol: { select: { nombreRol: true } },
    },
  });

  const ok = await verifyPassword(password, user?.password);
  if (!user || !ok) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  const role = mapNombreRolToAuth(user.rol.nombreRol);
  const token = await createAuthToken({ userId: user.id.toString(), role });

  const res = NextResponse.json({
    user: {
      id: user.id.toString(),
      email: user.email,
      name: user.nombre,
      role,
    },
  });
  setAuthCookieOnResponse(res, token);
  return res;
}
