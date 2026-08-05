// Sesión basada en cookie firmada (HMAC) — suficiente para la demo.
// En producción se reemplaza por NextAuth.js según el documento de arquitectura.

import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "mao_session";
const SECRET = process.env.AUTH_SECRET ?? "dev-secret";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 32);
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [userId, signature] = raw.split(".");
  if (!userId || sign(userId) !== signature) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { tenants: { include: { tenant: true } } },
  });
}
