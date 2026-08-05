"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";

export async function login(_prev: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  // Demo: comparación directa. En producción: hash bcrypt + NextAuth.
  if (!user || user.password !== password) {
    return { error: "Credenciales inválidas. Prueba demo@mao.co / demo1234" };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function register(_prev: { error?: string } | null, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const brandName = String(formData.get("brandName") ?? "").trim();
  const plan = String(formData.get("plan") ?? "BASIC");

  if (!name || !email || !password || !brandName) {
    return { error: "Todos los campos son obligatorios." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const slugBase = brandName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let slug = slugBase || "marca";
  if (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;
  }

  // Onboarding B2B automatizado: usuario + tenant + plan en una sola operación
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      role: "VENDOR",
      tenants: {
        create: {
          tenant: {
            create: {
              name: brandName,
              slug,
              plan,
              aiCredits: plan === "ENTERPRISE" ? 1000 : plan === "PRO" ? 500 : 100,
            },
          },
        },
      },
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
