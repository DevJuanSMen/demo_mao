"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

async function assertMember(tenantId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("No autorizado");
  }
  return user;
}

export async function saveWhatsappAction(tenantId: string, formData: FormData) {
  await assertMember(tenantId);

  // Solo dígitos: formato wa.me exige código de país sin + ni espacios
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "");

  await prisma.integration.upsert({
    where: { tenantId_platform: { tenantId, platform: "WHATSAPP" } },
    update: { sellerId: phone || null, isActive: phone.length > 0 },
    create: {
      tenantId,
      platform: "WHATSAPP",
      sellerId: phone || null,
      isActive: phone.length > 0,
    },
  });

  revalidatePath(`/dashboard/${tenantId}/settings`);
  revalidatePath(`/dashboard/${tenantId}/channels`);
}
