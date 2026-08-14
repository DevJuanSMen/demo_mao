"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateListing } from "@/lib/ai/listing";
import { computeAiScore } from "@/lib/ai/scoring";
import { parseJsonArray } from "@/lib/constants";

async function assertMember(tenantId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("No autorizado");
  }
}

type Optimizable = {
  id: string;
  title: string;
  basePrice: number;
  images: string;
  aiScore: number | null;
};

// Regenera título, descripción y tags de un producto con la IA y
// recalcula su AI Score. Consume 1 crédito por producto.
async function optimizeOne(product: Optimizable) {
  const basicName = product.title.split("—")[0].trim();
  const listing = await generateListing(basicName, product.basePrice);
  const images = parseJsonArray(product.images);

  const aiScore = computeAiScore({
    title: listing.title,
    description: listing.description,
    basePrice: product.basePrice,
    images,
    aiTags: listing.tags,
  });

  await prisma.product.update({
    where: { id: product.id },
    data: {
      title: listing.title,
      description: listing.description,
      aiTags: JSON.stringify(listing.tags),
      suggestedPrice: listing.suggestedPrice,
      aiScore,
    },
  });

  return { from: product.aiScore ?? 0, to: aiScore, source: listing.source };
}

function revalidateAiHub(tenantId: string) {
  revalidatePath(`/dashboard/${tenantId}`, "layout");
  revalidatePath(`/dashboard/${tenantId}/ai-hub`);
  revalidatePath(`/dashboard/${tenantId}/products`);
}

export async function optimizeProductAction(tenantId: string, productId: string) {
  await assertMember(tenantId);

  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product) throw new Error("Producto no encontrado");

  const result = await optimizeOne(product);

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { aiCredits: { decrement: 1 } },
  });
  revalidateAiHub(tenantId);

  return result;
}

// Generación masiva: optimiza los listings con score más bajo del catálogo
// (por lotes de hasta 6 para no agotar créditos de golpe).
export async function optimizeCatalogAction(tenantId: string) {
  await assertMember(tenantId);

  const products = await prisma.product.findMany({
    where: { tenantId, OR: [{ aiScore: { lt: 70 } }, { aiScore: null }] },
    orderBy: { aiScore: "asc" },
    take: 6,
  });

  for (const product of products) {
    await optimizeOne(product);
  }

  if (products.length > 0) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { aiCredits: { decrement: products.length } },
    });
  }
  revalidateAiHub(tenantId);

  return { optimized: products.length };
}

// Aplica el precio sugerido por la IA como precio de venta del producto.
export async function applySuggestedPriceAction(tenantId: string, productId: string) {
  await assertMember(tenantId);

  const product = await prisma.product.findFirst({
    where: { id: productId, tenantId },
  });
  if (!product?.suggestedPrice) throw new Error("El producto no tiene precio sugerido");

  await prisma.product.update({
    where: { id: product.id },
    data: { basePrice: product.suggestedPrice },
  });
  revalidateAiHub(tenantId);

  return { newPrice: product.suggestedPrice };
}
