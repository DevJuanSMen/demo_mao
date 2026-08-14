"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export type AffiliateFormState = {
  error?: string;
  ok?: boolean;
  name?: string;
  code?: string;
};

async function assertMember(tenantId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("No autorizado");
  }
}

export async function createAffiliateAction(
  tenantId: string,
  _prev: AffiliateFormState | null,
  formData: FormData
): Promise<AffiliateFormState> {
  await assertMember(tenantId);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!name || !email || !code) {
    return { error: "Completa nombre, correo y código del afiliado." };
  }
  if (code.length < 3 || code.length > 20) {
    return { error: "El código debe tener entre 3 y 20 caracteres (letras y números)." };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { affiliateCode: code }] },
  });
  if (existing) {
    return {
      error:
        existing.email === email
          ? "Ya existe un usuario con ese correo."
          : `El código ${code} ya está en uso.`,
    };
  }

  await prisma.user.create({
    data: { name, email, role: "AFFILIATE", affiliateCode: code },
  });

  revalidatePath(`/dashboard/${tenantId}/affiliates`);
  return { ok: true, name, code };
}

// Marca como pagadas todas las comisiones pendientes de un afiliado
// (órdenes efectivas: excluye pendientes de pago y canceladas).
export async function payCommissionsAction(tenantId: string, affiliateId: string) {
  await assertMember(tenantId);

  const result = await prisma.order.updateMany({
    where: {
      tenantId,
      affiliateId,
      commissionPaid: false,
      status: { notIn: ["PENDING", "CANCELLED"] },
    },
    data: { commissionPaid: true },
  });

  revalidatePath(`/dashboard/${tenantId}/affiliates`);
  return { paid: result.count };
}
