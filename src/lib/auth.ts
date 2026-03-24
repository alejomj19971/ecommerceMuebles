import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export type AuthRole = "CUSTOMER" | "ADMIN";

const AUTH_COOKIE_NAME = "auth_token";

/** Mapea `roles.nombre_rol` al rol de sesión de la app. */
export function mapNombreRolToAuth(nombreRol: string): AuthRole {
  const n = nombreRol.trim().toLowerCase();
  if (n.includes("admin")) return "ADMIN";
  return "CUSTOMER";
}

function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Falta AUTH_SECRET en el entorno. Agrega AUTH_SECRET a .env"
    );
  }
  return new TextEncoder().encode(secret);
}

export type AuthSession = {
  userId: string;
  role: AuthRole;
};

export async function verifyPassword(
  password: string,
  storedHash?: string | null
) {
  if (!storedHash) return false;
  return bcrypt.compare(password, storedHash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function createAuthToken(payload: AuthSession) {
  const secretKey = getAuthSecretKey();
  const token = await new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  return token;
}

export async function getSessionFromCookie(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secretKey = getAuthSecretKey();
    type JwtPayload = { role: AuthRole; sub?: string };
    const { payload } = await jwtVerify<JwtPayload>(
      token,
      secretKey,
      { algorithms: ["HS256"] }
    );

    const userId = payload.sub;
    const role = payload.role;

    if (!userId || (role !== "CUSTOMER" && role !== "ADMIN")) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

export async function getMe() {
  const session = await getSessionFromCookie();
  if (!session) return null;

  let userId: bigint;
  try {
    userId = BigInt(session.userId);
  } catch {
    return null;
  }

  const u = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      nombre: true,
      rol: { select: { nombreRol: true } },
    },
  });
  if (!u) return null;

  return {
    id: u.id.toString(),
    email: u.email,
    name: u.nombre,
    role: mapNombreRolToAuth(u.rol.nombreRol),
  };
}

const AUTH_COOKIE_BASE = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

/** En Route Handlers, las cookies deben ir en `NextResponse` para que el cliente las reciba. */
export function setAuthCookieOnResponse(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    ...AUTH_COOKIE_BASE,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearAuthCookieOnResponse(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...AUTH_COOKIE_BASE,
    maxAge: 0,
  });
  return response;
}

