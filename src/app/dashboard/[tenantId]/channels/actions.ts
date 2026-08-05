"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { adaptListingForChannel } from "@/lib/ai/listing";

const SYNCABLE_PLATFORMS = ["MERCADOLIBRE", "FALABELLA", "EXITO"];

async function assertMember(tenantId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("No autorizado");
  }
}

// "Publicar en todos los canales": crea registros ExternalSync en PENDING
// para cada producto x canal activo que aún no esté publicado.
export async function publishAllAction(tenantId: string) {
  await assertMember(tenantId);

  const [products, integrations] = await Promise.all([
    prisma.product.findMany({ where: { tenantId }, include: { externalSyncs: true } }),
    prisma.integration.findMany({
      where: { tenantId, isActive: true, platform: { in: SYNCABLE_PLATFORMS } },
    }),
  ]);

  let created = 0;
  for (const product of products) {
    for (const integration of integrations) {
      const exists = product.externalSyncs.some((s) => s.platform === integration.platform);
      if (!exists) {
        await prisma.externalSync.create({
          data: { productId: product.id, platform: integration.platform, status: "PENDING" },
        });
        created++;
      }
    }
  }

  revalidatePath(`/dashboard/${tenantId}/channels`);
  return { created };
}

// Procesa la cola de sincronización: la IA adapta título/descripción a las
// reglas de cada canal y simula la publicación en la API externa.
// En producción esto corre como background job (BullMQ/Inngest).
export async function processSyncQueueAction(tenantId: string) {
  await assertMember(tenantId);

  const pending = await prisma.externalSync.findMany({
    where: { status: { in: ["PENDING", "FAILED"] }, product: { tenantId } },
    include: { product: true },
  });

  for (const sync of pending) {
    const adapted = adaptListingForChannel(
      sync.product.title,
      sync.product.description,
      sync.platform
    );
    const prefix = sync.platform === "MERCADOLIBRE" ? "MCO" : sync.platform === "FALABELLA" ? "FLB-SKU-" : "EXI-";
    await prisma.externalSync.update({
      where: { id: sync.id },
      data: {
        externalTitle: adapted.title,
        externalDesc: adapted.description,
        externalId: `${prefix}${Math.floor(100000 + Math.random() * 900000)}`,
        status: "SYNCED",
        lastSync: new Date(),
      },
    });
  }

  revalidatePath(`/dashboard/${tenantId}/channels`);
  return { processed: pending.length };
}

export async function toggleIntegrationAction(tenantId: string, platform: string) {
  await assertMember(tenantId);

  const existing = await prisma.integration.findUnique({
    where: { tenantId_platform: { tenantId, platform } },
  });
  if (existing) {
    await prisma.integration.update({
      where: { id: existing.id },
      data: { isActive: !existing.isActive },
    });
  } else {
    // Demo: la conexión real usa OAuth (ML/Meta) o API Keys (Falabella/Mirakl)
    await prisma.integration.create({
      data: { tenantId, platform, isActive: true, accessToken: "demo" },
    });
  }
  revalidatePath(`/dashboard/${tenantId}/channels`);
}
